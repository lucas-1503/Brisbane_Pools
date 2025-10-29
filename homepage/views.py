from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.http import JsonResponse, HttpResponseBadRequest
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.text import get_valid_filename

ALLOWED_MIME = {"image/jpeg", "image/png"}
MAX_FILES = 3
MAX_FILE_MB = 5
# (Opcional) limitar tamanho total do e-mail em MB
MAX_TOTAL_MB = 12

def home(request):
    return render(request, "home/home.html")

from django.http import HttpResponse

def robots_txt(_request):
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Sitemap: www.brisbane.pythonanywhere.com/sitemap.xml\n"
    )
    return HttpResponse(content, content_type="text/plain")


@require_POST
def quote_request(request):
    # -------- Campos obrigatórios --------
    full_name   = (request.POST.get("fullName") or "").strip()
    phone       = (request.POST.get("phone") or "").strip()
    address     = (request.POST.get("address") or "").strip()
    number      = (request.POST.get("address_number") or "").strip()
    postal_code = (request.POST.get("postal_code") or "").strip()

    if not all([full_name, phone, address, number, postal_code]):
        return HttpResponseBadRequest("Missing required fields")

    # -------- Opcionais --------
    pool_size = (request.POST.get("poolSize") or "").strip() or "—"
    pool_age  = (request.POST.get("poolAge") or "").strip() or "—"
    services  = request.POST.getlist("services")
    services_str = ", ".join(services) if services else "—"

    # -------- Arquivos --------
    files = request.FILES.getlist("photos")[:MAX_FILES]

    total_bytes = 0
    safe_files = []  # (name, bytes, content_type)
    for f in files:
        if f.content_type not in ALLOWED_MIME:
            return HttpResponseBadRequest("Invalid file type. Use JPG/PNG.")
        if f.size > MAX_FILE_MB * 1024 * 1024:
            return HttpResponseBadRequest(f"File {f.name} exceeds {MAX_FILE_MB}MB.")

        total_bytes += f.size
        safe_name = get_valid_filename(f.name)
        safe_files.append((safe_name, f.read(), f.content_type))

    if MAX_TOTAL_MB and total_bytes > MAX_TOTAL_MB * 1024 * 1024:
        return HttpResponseBadRequest(
            f"Total attachment size exceeds {MAX_TOTAL_MB}MB."
        )

    # -------- E-mail (texto + HTML) --------
    subject = f"[New Quote] {full_name} — {phone}"

    text_body = (
        "Novo pedido de orçamento\n"
        f"Nome: {full_name}\n"
        f"Telefone: {phone}\n"
        f"Endereço: {address}, {number}\n"
        f"CEP: {postal_code}\n"
        f"Tamanho: {pool_size}\n"
        f"Idade: {pool_age}\n"
        f"Serviços: {services_str}\n"
    )

    html_body = f"""
    <h2>Novo pedido de orçamento</h2>
    <p>
      <strong>Nome:</strong> {full_name}<br>
      <strong>Telefone:</strong> {phone}<br>
      <strong>Endereço:</strong> {address}, {number}<br>
      <strong>CEP:</strong> {postal_code}
    </p>

    <h3>Detalhes da piscina</h3>
    <ul>
      <li><strong>Tamanho:</strong> {pool_size} metros cúbicos</li>
      <li><strong>Idade:</strong> {pool_age} anos</li>
    </ul>

    <p><strong>Serviços:</strong> {services_str}</p>
    """

    to_email = getattr(settings, "QUOTE_TO_EMAIL", None) or settings.DEFAULT_FROM_EMAIL
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,            # fallback de texto
        from_email=from_email,
        to=[to_email],
    )
    msg.attach_alternative(html_body, "text/html")

    # anexos
    for name, content, ctype in safe_files:
        msg.attach(name, content, ctype)

    try:
        msg.send(fail_silently=False)
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=500)

    return JsonResponse({"ok": True})

