param(
  [Parameter(Mandatory = $true)][string]$Title,
  [Parameter(Mandatory = $true)][string]$Out,
  [int]$Frames = 50,
  [int]$IntervalMs = 100
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class NativeCapture {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr FindWindow(string cls, string title);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd, IntPtr hdc, uint flags);
}
"@
[void][NativeCapture]::SetProcessDPIAware()
$hwnd = [NativeCapture]::FindWindow([NullString]::Value, $Title)  # $null would reach .NET as "" and match no class
if ($hwnd -eq [IntPtr]::Zero) { throw "No window titled '$Title'" }
New-Item -ItemType Directory -Force -Path $Out | Out-Null
for ($i = 0; $i -lt $Frames; $i++) {
  $rect = New-Object NativeCapture+RECT
  [void][NativeCapture]::GetWindowRect($hwnd, [ref]$rect)
  $w = $rect.Right - $rect.Left
  $h = $rect.Bottom - $rect.Top
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [void][NativeCapture]::PrintWindow($hwnd, $hdc, 2)  # 2 = PW_RENDERFULLCONTENT, needed for GPU-drawn windows
  $g.ReleaseHdc($hdc)
  $bmp.Save((Join-Path $Out ('frame-{0:D2}.png' -f $i)), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  Start-Sleep -Milliseconds $IntervalMs
}
"Saved $Frames frames to $Out"
