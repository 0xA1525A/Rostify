fn main() -> () {
    match rostify_core::initialise() {
        Ok(_) => {
            
        }
        Err(_) => {
            println!("TEST!");
        }
    };
}