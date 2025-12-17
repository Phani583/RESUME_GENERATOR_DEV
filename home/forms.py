from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    phone = forms.CharField(required=False, max_length=20)

    class Meta:
        model = User
        fields = ("email", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("User with this email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)

        # 👇 THIS IS THE KEY FIX
        user.username = self.cleaned_data["email"]
        user.email = self.cleaned_data["email"]

        if commit:
            user.save()
            user.profile.phone = self.cleaned_data.get("phone")
            user.profile.save()

        return user
