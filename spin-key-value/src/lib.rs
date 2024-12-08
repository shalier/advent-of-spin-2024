use spin_sdk::{
    http::{IntoResponse, Request, Response},
    key_value::Store,
};
use spin_sdk::http_component;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Wishlist {
    name: String,
    items: Vec<String>,
}

#[http_component]
fn handle_request(req: Request) -> anyhow::Result<impl IntoResponse> {
    let store = Store::open_default()?;
    if req.method().to_string() == "POST"{
        if let Ok(new_wishlist) = serde_json::from_slice::<Wishlist>(req.body()) {
            let mut wishlists = match store.get(req.path())? {
                Some(existing_data) => {
                    serde_json::from_slice::<Vec<Wishlist>>(&existing_data)
                        .unwrap_or_default()
                }
                None => Vec::new(),
            };
            
            wishlists.push(new_wishlist);
            
            let json_string = serde_json::to_string(&wishlists)?;
            store.set(req.path(), json_string.as_bytes())?;
            
            println!(
                "Added new wishlist to collection at key {:?}",
                req.path()
            );
             return Ok(Response::builder()
                .status(201)
                .build())
        } else {
            return Ok(Response::builder()
                .status(400)
                .build())
        }
    } 
    if req.method().to_string() == "GET" {
        match store.get(req.path())? {
            Some(value) => {
                println!("Found value for the key {:?}", req.path());
                return Ok(Response::builder()
                    .status(200)
                    .header("content-type", "application/json")
                    .body(value)
                    .build())
            }
            None => {
                println!("No value found for the key {:?}", req.path());
                return Ok(Response::builder()
                    .status(404)
                    .body("No value found")
                    .build())
            }
        }
    } 
    println!("Delete key {:?}", req.path());
    store.delete(req.path())?;
    return Ok(Response::builder()
        .status(200)
        .build())
}