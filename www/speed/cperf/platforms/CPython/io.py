import asyncio
import json
import os
import sys

from .abstract_io import Config, Reporter

_ASYNC = True


class EnvironConfig(Config):
    def __index__(self):
        super().__init__()
        self._config = json.loads(os.environ['CONFIG'])

PlatformConfig = EnvironConfig


class ConsoleReporter(Reporter):
    def _send(self, data):
        print(json.dumps({'event': data}))

PlatformReporter = ConsoleReporter
