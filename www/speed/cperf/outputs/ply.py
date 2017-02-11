import base64
import six
import requests


class Client:

    def _headers(self):
        encoded_api_auth = base64.b64encode(six.b('{0}:{1}'.format(self.name, self.api_key))).decode('utf8')
        headers = {
            'plotly-client-platform': 'python',
            'authorization': 'Basic ' + encoded_api_auth
        }
        return headers

    def _url(self, resource):
        return 'https://api.plot.ly/v2/'+resource

    def _grid_url(self, grid_name):
        for f in self.list_files():
            if f['name'] == grid_name:
                return f['grid_url']
        return None

    def __init__(self, name, api_key):
        self.name = name
        self.api_key = api_key
        self._files = None

    def _load_files_response(self, resp):
        for file in resp['children']['results']:
            file_meta = {
                'name': file['filename'],
                'type': file['filetype'],
                'id': file['fid'],
                'grid_url': file['api_urls']['grids']
            }
            self._files.append(file_meta)
        return resp['children']['first'], resp['children']['next'], resp['children']['last']

    def list_files(self, no_cache=False):
        if self._files is None or no_cache:
            self._files = []
            resp = requests.get(self._url('folders')+'/home', headers=self._headers(), verify=True).json()
            first_page, next_page, last_page = self._load_files_response(resp)
            while next_page is not None:
                resp = requests.get(next_page, headers=self._headers(), verify=True).json()
                first_page, next_page, last_page = self._load_files_response(resp)
        return self._files

    def grid_exists(self, name):
        return self._grid_url(name) is not None

    def create_grid(self, name, col_headers, rows=[]):
        order = 0
        cols = {}

        for col in col_headers:
            cols[col] = {'data': [], 'order': order}
            order += 1

        for row in rows:
            for header, col in cols.items():
                col['data'].append(row[header])

        payload = {
            'filename': name,
            'data': {
                'cols': cols
            }
        }

        resp = requests.post(
            self._url('grids'),
            headers=self._headers(),
            json=payload,
            verify=True
        )
        grid = resp.json()
        if self._files is not None:
            self._files.append({
                'name': name,
                'type': 'grid',
                'id': grid['file']['fid'],
                'grid_url': grid['file']['api_urls']['grids']
            })
        return resp

    def create_or_append(self, grid_name, col_headers, rows):
        if self.grid_exists(grid_name):
            return self.append_rows(grid_name, col_headers, rows)
        else:
            return self.create_grid(grid_name, col_headers, rows)

    def append_rows(self, grid_name, col_headers, rows):
        payload = {
            'rows': [[row[c] for c in col_headers] for row in rows]
        }
        resp = requests.post(
            self._grid_url(grid_name)+'/row',
            json=payload,
            headers=self._headers(),
            verify=True
        )
        return resp
