# core/sitemaps.py
from django.contrib.sitemaps import Sitemap
from django.urls import reverse

class StaticViewSitemap(Sitemap):
    changefreq = "weekly"     # ou "daily" se atualizar com frequência
    priority = 1.0            # 1.0 = mais importante
    protocol = "https"        # se seu site usa HTTPS

    def items(self):
        # apenas as rotas que você quer no sitemap
        return ["home"]

    def location(self, item):
        return reverse(item)
