# docs/xuy/_common.py —— 各分组共享的变量
import json, os

_HERE = os.path.dirname(os.path.abspath(__file__))
_SITE = os.path.dirname(os.path.dirname(_HERE))  # site/

try:
    with open(os.path.join(_SITE, '../../core/package.json'), encoding='utf-8') as f:
        XUNAY_VERSION = json.load(f)['version']
except Exception:
    XUNAY_VERSION = '1.2.8'

# 版本字符串，各模块可直接 from ._common import XUNAY_VERSION
__all__ = ['XUNAY_VERSION']
