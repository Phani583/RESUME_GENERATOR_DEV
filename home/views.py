from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib import messages
from .models import Profile
from django.shortcuts import redirect


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

    # ---------- SIGNUP ----------
    if request.method == "POST" and "signup" in request.POST:
        phone = request.POST.get("phone")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        if password != confirm_password:
            messages.error(request, "Passwords do not match")
            return redirect("rb_login")

        if User.objects.filter(username=email).exists():
            messages.error(request, "Email already exists")
            return redirect("rb_login")

        if len(password) < 6:
            messages.error(request, "Password must be at least 6 characters")
            return redirect("rb_login")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        Profile.objects.create(user=user, phone=phone)

        messages.success(request, "Account created successfully. Please login.")
        return redirect("rb_login")

    # ---------- LOGIN ----------
    if request.method == "POST" and "login" in request.POST:
        email = request.POST.get("email")
        password = request.POST.get("password")

        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            return redirect("home")
        else:
            messages.error(request, "Invalid email or password")
            return redirect("rb_login")

    return render(request, "rb_login.html")

