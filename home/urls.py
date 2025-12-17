from django.urls import path
from .views import (
    home_page, index_page,
    preview_1, preview_2, preview_3, preview_4, preview_5, preview_6,
    rb_login, register_user, login_user, logout_user,
    
)

from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', rb_login, name='rb_login'),
    path('editor/', index_page, name='editor'),
     # Preview Templates
    path('preview/', preview_1, name='preview1'),
    path('preview2/', preview_2, name='preview2'),
    path('preview3/', preview_3, name='preview3'),
    path('preview4/', preview_4, name='preview4'),
    path('preview5/', preview_5, name='preview5'),
    path('preview6/', preview_6, name='preview6'),
        # Home and Auth Paths
    path('home/', home_page, name='home'),
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),

        # Email Verification Path
  


        # 🔐 Forgot Password URLs
    path(
        'forgot-password/',
        auth_views.PasswordResetView.as_view(
            template_name='forgot_password.html'
        ),
        name='password_reset'
    ),
    path(
        'forgot-password/done/',
        auth_views.PasswordResetDoneView.as_view(
            template_name='forgot_password_done.html'
        ),
        name='password_reset_done'
    ),
    path(
        'reset/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='reset_password.html'
        ),
        name='password_reset_confirm'
    ),
    path(
        'reset/done/',
        auth_views.PasswordResetCompleteView.as_view(
            template_name='reset_password_done.html'
        ),
        name='password_reset_complete'
    ),
    ]