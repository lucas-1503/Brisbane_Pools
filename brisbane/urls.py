from django.contrib import admin
from django.urls import path, include
from django.contrib.sitemaps.views import sitemap
from homepage.sitemaps import StaticViewSitemap
from homepage import views

sitemaps = {
    "static": StaticViewSitemap,
}

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path("api/quote/", views.quote_request, name="quote-request"),
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="sitemap"),
    path("robots.txt", views.robots_txt, name="robots"),
]
