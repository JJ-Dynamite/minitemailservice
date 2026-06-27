use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;
use uuid::Uuid;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct TempEmail {
    address: String,
    domain: String,
    expires_at: String,
    messages_count: u32,
}

#[derive(Serialize)]
struct EmailMessage {
    id: String,
    from: String,
    subject: String,
    preview: String,
    received_at: String,
    is_read: bool,
}

#[derive(Deserialize)]
struct CreateEmailRequest {
    domain: Option<String>,
    expiration_minutes: Option<u32>,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Instant temporary email".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn create_email(Json(req): Json<CreateEmailRequest>) -> impl IntoResponse {
    let id = Uuid::new_v4().to_string();
    let domain = req.domain.unwrap_or_else(|| "tempmail.dev".to_string());
    let expiration = req.expiration_minutes.unwrap_or(60);

    let email = TempEmail {
        address: format!("{}@{}", &id[..8], domain),
        domain,
        expires_at: chrono::Utc::now()
            .checked_add_signed(chrono::Duration::minutes(expiration as i64))
            .unwrap()
            .to_rfc3339(),
        messages_count: 0,
    };

    Json(ApiResponse {
        success: true,
        data: Some(email),
        error: None,
    })
}

async fn get_messages(Json(req): Json<serde_json::Value>) -> impl IntoResponse {
    let address = req.get("address").and_then(|v| v.as_str()).unwrap_or("");
    
    let messages = vec![
        EmailMessage {
            id: Uuid::new_v4().to_string(),
            from: "noreply@example.com".to_string(),
            subject: "Welcome to our service".to_string(),
            preview: "Thank you for signing up! Here's your verification code...".to_string(),
            received_at: chrono::Utc::now().to_rfc3339(),
            is_read: false,
        },
        EmailMessage {
            id: Uuid::new_v4().to_string(),
            from: "team@startup.io".to_string(),
            subject: "Your account is ready".to_string(),
            preview: "Your account has been created successfully. You can now...".to_string(),
            received_at: chrono::Utc::now().to_rfc3339(),
            is_read: true,
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(messages),
        error: None,
    })
}

async fn get_domains() -> impl IntoResponse {
    let domains = vec![
        serde_json::json!({ "domain": "tempmail.dev", "available": true, "popularity": 95 }),
        serde_json::json!({ "domain": "throwaway.email", "available": true, "popularity": 88 }),
        serde_json::json!({ "domain": "guerrillamail.com", "available": true, "popularity": 92 }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(domains),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_emails_created": 5678901,
            "emails_today": 23456,
            "messages_received": 12345678,
            "domains_available": 15
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/create", post(create_email))
        .route("/api/messages", post(get_messages))
        .route("/api/domains", get(get_domains))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Instant temporary email backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
