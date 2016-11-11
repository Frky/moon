from django import forms


class AnonymousForm(forms.Form):
    username = forms.CharField(
        label='Username', 
        max_length=64,
    )
    form_type = forms.CharField(
        label='form-type', 
        max_length=64, 
        initial='anonymous',
        widget=forms.HiddenInput,
    )

class RegisteredForm(AnonymousForm):
    password = forms.CharField(
        label='password', 
        widget=forms.PasswordInput,
    )
    form_type = forms.CharField(
        label='form-type', 
        max_length=64, 
        initial='anonymous',
        widget=forms.HiddenInput,
    )
