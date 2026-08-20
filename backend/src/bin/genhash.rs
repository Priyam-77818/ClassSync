use bcrypt::{hash, DEFAULT_COST};
fn main() {
    let new_key = "admin123";
    let h = hash(new_key, DEFAULT_COST).unwrap();
    println!("Key: {}", new_key);
    println!("Hash: {}", h);
}
