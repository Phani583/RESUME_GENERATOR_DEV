from django.shortcuts import render

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
