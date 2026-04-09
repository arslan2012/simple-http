use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct KeyValue {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HttpRequest {
    pub id: String,
    pub name: String,
    pub group_id: Option<String>,
    pub method: String,
    pub url: String,
    pub headers: Vec<KeyValue>,
    pub params: Vec<KeyValue>,
    pub body: String,
    pub body_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestGroup {
    pub id: String,
    pub name: String,
    pub collapsed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct SavedData {
    pub groups: Vec<RequestGroup>,
    pub requests: Vec<HttpRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub duration_ms: u64,
    pub size: usize,
}

fn get_data_path(app: &tauri::AppHandle) -> PathBuf {
    let data_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data dir");
    fs::create_dir_all(&data_dir).ok();
    data_dir.join("requests.json")
}

fn load_data(path: &PathBuf) -> SavedData {
    if path.exists() {
        let content = fs::read_to_string(path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        SavedData::default()
    }
}

fn save_data(path: &PathBuf, data: &SavedData) -> Result<(), String> {
    let content = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn send_request(request: HttpRequest) -> Result<HttpResponse, String> {
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| e.to_string())?;

    let method = reqwest::Method::from_bytes(request.method.as_bytes())
        .map_err(|e| e.to_string())?;

    let mut req_builder = client.request(method, &request.url);

    // Query params
    let params: Vec<(&str, &str)> = request
        .params
        .iter()
        .filter(|p| p.enabled && !p.key.is_empty())
        .map(|p| (p.key.as_str(), p.value.as_str()))
        .collect();
    if !params.is_empty() {
        req_builder = req_builder.query(&params);
    }

    // Headers
    for h in &request.headers {
        if h.enabled && !h.key.is_empty() {
            let name = reqwest::header::HeaderName::from_bytes(h.key.as_bytes())
                .map_err(|e| e.to_string())?;
            let value = reqwest::header::HeaderValue::from_str(&h.value)
                .map_err(|e| e.to_string())?;
            req_builder = req_builder.header(name, value);
        }
    }

    // Body
    if request.body_type != "none" && !request.body.is_empty() {
        if request.body_type == "json" {
            req_builder = req_builder
                .header("Content-Type", "application/json")
                .body(request.body.clone());
        } else {
            req_builder = req_builder.body(request.body.clone());
        }
    }

    let start = std::time::Instant::now();
    let response = req_builder.send().await.map_err(|e| e.to_string())?;
    let duration_ms = start.elapsed().as_millis() as u64;

    let status = response.status().as_u16();
    let status_text = response
        .status()
        .canonical_reason()
        .unwrap_or("Unknown")
        .to_string();

    let mut headers = HashMap::new();
    for (key, value) in response.headers() {
        headers.insert(key.to_string(), value.to_str().unwrap_or("").to_string());
    }

    let body = response.text().await.map_err(|e| e.to_string())?;
    let size = body.len();

    Ok(HttpResponse {
        status,
        status_text,
        headers,
        body,
        duration_ms,
        size,
    })
}

#[tauri::command]
fn load_requests(app: tauri::AppHandle) -> SavedData {
    let path = get_data_path(&app);
    load_data(&path)
}

#[tauri::command]
fn save_request(app: tauri::AppHandle, request: HttpRequest) -> Result<(), String> {
    let path = get_data_path(&app);
    let mut data = load_data(&path);
    if let Some(existing) = data.requests.iter_mut().find(|r| r.id == request.id) {
        *existing = request;
    } else {
        data.requests.push(request);
    }
    save_data(&path, &data)
}

#[tauri::command]
fn delete_request(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let path = get_data_path(&app);
    let mut data = load_data(&path);
    data.requests.retain(|r| r.id != id);
    save_data(&path, &data)
}

#[tauri::command]
fn save_group(app: tauri::AppHandle, group: RequestGroup) -> Result<(), String> {
    let path = get_data_path(&app);
    let mut data = load_data(&path);
    if let Some(existing) = data.groups.iter_mut().find(|g| g.id == group.id) {
        *existing = group;
    } else {
        data.groups.push(group);
    }
    save_data(&path, &data)
}

#[tauri::command]
fn delete_group(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let path = get_data_path(&app);
    let mut data = load_data(&path);
    data.groups.retain(|g| g.id != id);
    for req in &mut data.requests {
        if req.group_id.as_deref() == Some(&id) {
            req.group_id = None;
        }
    }
    save_data(&path, &data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            send_request,
            load_requests,
            save_request,
            delete_request,
            save_group,
            delete_group,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
