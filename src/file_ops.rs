use rfd::FileDialog;
use std::fs;
pub fn pick_open_file(language: &str) -> Option<String> {
    let all_files = if language == "zh-CN" { "所有文件" } else { "All files" };
    FileDialog::new()
        .add_filter("Markdown", &["md", "markdown", "txt"])
        .add_filter(all_files, &["*"])
        .pick_file()
        .map(|p| p.to_string_lossy().to_string())
}

pub fn pick_save_file(language: &str) -> Option<String> {
    let all_files = if language == "zh-CN" { "所有文件" } else { "All files" };
    FileDialog::new()
        .add_filter("Markdown", &["md", "markdown"])
        .add_filter(all_files, &["*"])
        .set_file_name("untitled.md")
        .save_file()
        .map(|p| p.to_string_lossy().to_string())
}

pub fn read_file(path: &str) -> Result<String, std::io::Error> {
    fs::read_to_string(path)
}

pub fn write_file(path: &str, content: &str) -> Result<(), std::io::Error> {
    fs::write(path, content)
}
