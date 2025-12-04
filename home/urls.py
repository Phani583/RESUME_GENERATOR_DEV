from django.urls import path
from .views import home_page, index_page, preview_1, preview_2, preview_3, preview_4 , preview_5, preview_6

urlpatterns = [
    path('', home_page, name='home'),
    path('editor/', index_page, name='editor'),
     # Preview Templates
    path('preview/', preview_1, name='preview1'),
    path('preview2/', preview_2, name='preview2'),
    path('preview3/', preview_3, name='preview3'),
    path('preview4/', preview_4, name='preview4'),
    path('preview5/', preview_5, name='preview5'),
    path('preview6/', preview_6, name='preview6'),

]