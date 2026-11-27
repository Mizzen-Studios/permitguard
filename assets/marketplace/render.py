#!/usr/bin/env python3
"""Offline SVG → PNG using already installed librsvg/cairo; no package installs."""
from pathlib import Path
import ctypes as C
import ctypes.util

HERE = Path(__file__).resolve().parent

def render(name):
    r = C.CDLL(ctypes.util.find_library('rsvg-2'))
    c = C.CDLL(ctypes.util.find_library('cairo'))
    g = C.CDLL(ctypes.util.find_library('gobject-2.0'))
    r.rsvg_handle_new_from_file.argtypes = [C.c_char_p, C.POINTER(C.c_void_p)]
    r.rsvg_handle_new_from_file.restype = C.c_void_p
    r.rsvg_handle_render_document.argtypes = [C.c_void_p, C.c_void_p, C.c_void_p, C.POINTER(C.c_void_p)]
    r.rsvg_handle_render_document.restype = C.c_int
    c.cairo_image_surface_create.argtypes = [C.c_int, C.c_int, C.c_int]
    c.cairo_image_surface_create.restype = C.c_void_p
    c.cairo_create.argtypes = [C.c_void_p]
    c.cairo_create.restype = C.c_void_p
    c.cairo_surface_write_to_png.argtypes = [C.c_void_p, C.c_char_p]
    c.cairo_surface_write_to_png.restype = C.c_int
    c.cairo_destroy.argtypes = [C.c_void_p]
    c.cairo_surface_destroy.argtypes = [C.c_void_p]
    g.g_object_unref.argtypes = [C.c_void_p]
    class Rect(C.Structure):
        _fields_ = [(x, C.c_double) for x in ('x', 'y', 'width', 'height')]
    import xml.etree.ElementTree as ET
    root = ET.parse(HERE / (name + '.svg')).getroot()
    w, h = int(root.get('width')), int(root.get('height'))
    err = C.c_void_p()
    handle = r.rsvg_handle_new_from_file(str(HERE / (name + '.svg')).encode(), C.byref(err))
    assert handle and not err.value, 'SVG load failed'
    surface = c.cairo_image_surface_create(0, w, h)
    cr = c.cairo_create(surface)
    try:
        assert r.rsvg_handle_render_document(handle, cr, C.byref(Rect(0, 0, w, h)), C.byref(err)) and not err.value
        assert c.cairo_surface_write_to_png(surface, str(HERE / (name + '.png')).encode()) == 0
    finally:
        c.cairo_destroy(cr)
        c.cairo_surface_destroy(surface)
        g.g_object_unref(handle)
    print(name, w, h, 'rendered locally with installed librsvg/cairo')

if __name__ == '__main__':
    for name in ('icon', 'banner'):
        render(name)
