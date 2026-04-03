$files = git ls-files -o --exclude-standard
foreach ($file in $files) {
    if (-not (Test-Path -Path $file -PathType Container)) {
        git add "$file"
        git commit -m "add small chunk: $file"
    }
}
git branch -M main
git push -u origin main
