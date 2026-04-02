import urllib.request
import json

try:
    url = "https://api.github.com/repos/Ishaan-jha-dev/Ishaan-jha-dev/commits"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if len(data) > 0:
            commit = data[0]
            author_email = commit['commit']['author']['email']
            print(f"FOUND EMAIL: {author_email}")
        else:
            print("No commits found.")
except Exception as e:
    print(f"Error: {e}")
