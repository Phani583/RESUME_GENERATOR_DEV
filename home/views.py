from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from .forms import RegisterForm
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import random
from datetime import timedelta
from django.contrib.auth.models import User

# Create your views here.
def home_page(request):
    return render(request, 'home.html')

def index_page(request):
    return render(request, 'index.html')

def preview_1(request):
    return render(request, 'preview.html')

def preview_2(request):
    return render(request, 'preview2.html')

def preview_3(request):
    return render(request, 'preview3.html')

def preview_4(request):
    return render(request, 'preview4.html')

def preview_5(request):
    return render(request, 'preview5.html')

def preview_6(request):
    return render(request, 'preview6.html')

def rb_login(request):
    return render(request, "rb_login.html", {
        "form": RegisterForm()
    })


def register_user(request):
    if request.method != "POST":
        return redirect("rb_login")

    # ===============================
    # STEP 1: SEND OTP (AJAX)
    # ===============================
    if request.POST.get("action") == "send_otp":
        email = request.POST.get("email")

        if not email:
            return JsonResponse({"error": "Email required"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already exists"}, status=400)

        otp = str(random.randint(100000, 999999))

        request.session["signup_otp"] = otp
        request.session["signup_email"] = email
        request.session["otp_time"] = timezone.now().isoformat()

        try:
            send_mail(
                "Verify your email",
                f"Your OTP is {otp}. Valid for 5 minutes.",
                settings.EMAIL_HOST_USER,
                [email],
            )
        except Exception:
            return JsonResponse({"error": "Failed to send OTP"}, status=500)

        return JsonResponse({"success": "OTP sent successfully"})


    # ===============================
    # STEP 2: VERIFY OTP + CREATE USER
    # ===============================
    form = RegisterForm(request.POST)
    otp_entered = request.POST.get("otp")

    session_otp = request.session.get("signup_otp")
    session_email = request.session.get("signup_email")
    otp_time = request.session.get("otp_time")

    if not session_otp or not otp_time:
        messages.error(request, "Please verify your email first.")
        return redirect("rb_login")

    otp_time = timezone.datetime.fromisoformat(otp_time)

    if timezone.now() > otp_time + timedelta(minutes=5):
        messages.error(request, "OTP expired.")
        return redirect("rb_login")

    if otp_entered != session_otp:
        messages.error(request, "Invalid OTP.")
        return redirect("rb_login")

    if not form.is_valid():
        return render(request, "rb_login.html", {
            "form": form,
            "show_panel": "register"
        })

    user = form.save(commit=False)

    if user.email != session_email:
        messages.error(request, "Email mismatch.")
        return redirect("rb_login")

    user.username = user.email
    user.save()

    user.profile.email_verified = True
    user.profile.save()

    # cleanup only OTP session
    request.session.pop("signup_otp", None)
    request.session.pop("signup_email", None)
    request.session.pop("otp_time", None)

    login(request, user)
    messages.success(request, "Account created successfully!")
    return redirect("home")



def login_user(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        user = authenticate(username=email, password=password)

        if not user:
            messages.error(request, "Invalid credentials")
            return redirect("rb_login")

        if not user.profile.email_verified:
            messages.error(request, "Please verify your email first")
            return redirect("rb_login")

        login(request, user)
        return redirect("home")

    return redirect("rb_login")


def logout_user(request):
    logout(request)
    return redirect("rb_login")