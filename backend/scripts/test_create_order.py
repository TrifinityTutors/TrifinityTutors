import json
from urllib import request, error

url = 'http://localhost:5000/api/bookings/create-order'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTgxOTdlMTcyZDhhMDdmYTAzM2QzZiIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzc5OTY0Mjg2LCJleHAiOjE3ODA1NjkwODZ9.wIANbRBfasuRh5fd0qpHV_2DwJ967shPGowaGaF-ctY'
}
body = json.dumps({
    'tutorId': '6a18197e172d8a07fa033d3d',
    'date': '2026-06-01',
    'timeSlot': '10:00 AM',
    'mode': 'online',
    'duration': 1,
    'subtotal': 500,
    'platformFee': 50,
    'total': 550,
}).encode('utf-8')
req = request.Request(url, data=body, headers=headers, method='POST')
try:
    with request.urlopen(req) as res:
        print(res.status)
        print(res.read().decode())
except error.HTTPError as e:
    print('ERR', e.code)
    print(e.read().decode())
