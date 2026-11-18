#!/usr/bin/env python3
"""The local preview of rune-architect.html, for testing a build in the browser.

    python3 tools/preview-server.py [root] [port]      # defaults: this folder, 8080

Why not `python3 -m http.server`: the build is one 6.8 MB HTML page. The stock server is
single-threaded, speaks HTTP/1.0 and drops the connection on a refused range request, which
looks like a hung preview behind a proxy. This one is threaded, keeps connections alive,
sends no-store so a rebuild is always the page you get, and allows itself to be framed
(the preview panel embeds it).
"""
import os, sys, functools, http.server, socketserver

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else HERE
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8080

class H(http.server.SimpleHTTPRequestHandler):
    # python's version leaves these at HTTP/1.0, which makes a 6.8 MB page feel slow behind a proxy
    protocol_version = "HTTP/1.1"
    server_version = "veyrath-preview/1.0"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        # nothing here should be framed-blocked by a preview proxy
        self.send_header("X-Frame-Options", "ALLOWALL")
        self.send_header("Content-Security-Policy", "frame-ancestors *")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (ConnectionResetError, BrokenPipeError):
            self.close_connection = True

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    os.chdir(ROOT)
    srv = Server(("0.0.0.0", PORT), functools.partial(H, directory=ROOT))
    print(f"serving {ROOT} on http://0.0.0.0:{PORT}", flush=True)
    srv.serve_forever()
