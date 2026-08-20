use bcrypt::verify;
fn main() {
    let hash = "$2b$12$p6iy1Fciwj.IasMAVBEhOODdgfoQZx3vFsiP2m8Uql.sA9Cc9/e9W";
    let candidates = ["Pass", "pass", "admin", "Admin", "1234", "password", "Password", "classsync", "ClassSync", "key", "Key", "123456", "test", "Test", "secret", "qwerty", "abc123"];
    for c in &candidates {
        if verify(c, hash).unwrap_or(false) {
            println!("MATCH: {}", c);
            return;
        }
    }
    println!("No match found in list");
}
