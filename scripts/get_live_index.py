import urllib.request
import re

url = 'https://linzerask.github.io/dsg/Website/index.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache, no-store'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        for match in re.finditer(r'src=["\']([^"\']+)["\']', html):
            print('Script src:', match.group(1))
        for match in re.finditer(r'href=["\']([^"\']+\.css[^"\']*)["\']', html):
            print('CSS href:', match.group(1))
except Exception as e:
    print('Error:', e)
