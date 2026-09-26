fn main() {
    for asset in [
        "src/frontend/vendor/math/libraries.js",
        "src/frontend/vendor/math/katex.css",
    ] {
        assert!(
            std::path::Path::new(asset).is_file(),
            "Missing {asset}. Run `npm ci --ignore-scripts` and `npm run build:math` before building Peekdown."
        );
        println!("cargo:rerun-if-changed={asset}");
    }
    println!("cargo:rerun-if-changed=assets/icon.ico");
    let mut res = winresource::WindowsResource::new();
    res.set_icon("assets/icon.ico");
    res.compile().unwrap();
}
