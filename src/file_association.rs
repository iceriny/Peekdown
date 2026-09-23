use std::os::windows::ffi::OsStrExt;
use std::process::Command;
use windows::core::PCWSTR;
use windows::Win32::System::Registry::{
    RegCloseKey, RegCreateKeyW, RegSetValueExW, HKEY, HKEY_CURRENT_USER, REG_NONE, REG_SZ,
    REG_VALUE_TYPE,
};

fn set_value(
    key_path: &str,
    name: Option<&str>,
    value: &str,
    kind: REG_VALUE_TYPE,
) -> Result<(), String> {
    let path: Vec<u16> = key_path.encode_utf16().chain(Some(0)).collect();
    let name_wide: Vec<u16> = name.unwrap_or("").encode_utf16().chain(Some(0)).collect();
    let value_wide: Vec<u16> = value.encode_utf16().chain(Some(0)).collect();
    let bytes: Vec<u8> = value_wide
        .iter()
        .flat_map(|unit| unit.to_le_bytes())
        .collect();
    let mut key = HKEY::default();
    unsafe {
        let result = RegCreateKeyW(HKEY_CURRENT_USER, PCWSTR(path.as_ptr()), &mut key);
        if result.0 != 0 {
            return Err(format!(
                "registry key {key_path}: Windows error {}",
                result.0
            ));
        }
        let value_name = if name.is_some() {
            PCWSTR(name_wide.as_ptr())
        } else {
            PCWSTR::null()
        };
        let data = if kind == REG_NONE {
            None
        } else {
            Some(bytes.as_slice())
        };
        let result = RegSetValueExW(key, value_name, None, kind, data);
        let _ = RegCloseKey(key);
        if result.0 != 0 {
            return Err(format!(
                "registry value {key_path}: Windows error {}",
                result.0
            ));
        }
    }
    Ok(())
}

fn set_string(key_path: &str, name: Option<&str>, value: &str) -> Result<(), String> {
    set_value(key_path, name, value, REG_SZ)
}

pub fn register_and_open_settings(language: &str) -> Result<(), String> {
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe = exe.as_os_str().encode_wide().collect::<Vec<_>>();
    let exe = String::from_utf16(&exe).map_err(|e| e.to_string())?;
    let command = format!("\"{exe}\" \"%1\"");

    let chinese = language == "zh-CN";
    for (extension, prog_id, description) in [
        (
            ".md",
            "Peekdown.md",
            if chinese {
                "Peekdown Markdown 文档"
            } else {
                "Peekdown Markdown document"
            },
        ),
        (
            ".txt",
            "Peekdown.txt",
            if chinese {
                "Peekdown 文本文档"
            } else {
                "Peekdown text document"
            },
        ),
    ] {
        let class_path = format!(r"Software\Classes\{prog_id}");
        set_string(&class_path, None, description)?;
        set_string(
            &format!(r"{class_path}\DefaultIcon"),
            None,
            &format!("\"{exe}\",0"),
        )?;
        set_string(&format!(r"{class_path}\shell\open\command"), None, &command)?;
        set_value(
            &format!(r"Software\Classes\{extension}\OpenWithProgids"),
            Some(prog_id),
            "",
            REG_NONE,
        )?;
        set_string(
            r"Software\Peekdown\Capabilities\FileAssociations",
            Some(extension),
            prog_id,
        )?;
    }

    set_string(
        r"Software\Peekdown\Capabilities",
        Some("ApplicationName"),
        "Peekdown",
    )?;
    set_string(
        r"Software\Peekdown\Capabilities",
        Some("ApplicationDescription"),
        if chinese {
            "Markdown 与文本查看和编辑器"
        } else {
            "Markdown and text viewer/editor"
        },
    )?;
    set_string(
        r"Software\RegisteredApplications",
        Some("Peekdown"),
        r"Software\Peekdown\Capabilities",
    )?;

    Command::new("explorer.exe")
        .arg("ms-settings:defaultapps?registeredAppUser=Peekdown")
        .spawn()
        .map_err(|e| format!("could not open Windows Settings: {e}"))?;
    Ok(())
}
