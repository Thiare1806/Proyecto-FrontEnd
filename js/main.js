$(document).ready(function () {
    $('#otherCountry').hide();
    let dataBase = JSON.parse(localStorage.getItem("contactos")) || []

    if (dataBase.length > 0) {
        let tbody = $('#tabla-contactos tbody');

        dataBase.forEach(function (contacto) {
            tbody.append(`
                <tr data-id="${contacto.id}">
                    <td>${contacto.nombre}</td>
                    <td>${contacto.email}</td>
                    <td>${contacto.celular} </td>
                    <td>${contacto.pais}</td>
                    <td>${contacto.comentarios}</td>
                    <td>
                        <button id="edit" class="btn btn-sm btn-success editar my-2">Editar</button>
                        <button id="eliminate" class="btn btn-sm btn-danger eliminar mx-4 my-2">Eliminar</button>
                    </td>
                </tr>
            `);
        });

        $('#tabla-contactos').show();
    } else {
        $('#mensaje-sin-contactos').show()
    }

    //Llenar seleccion de paises con API
    $.ajax({
        url: 'https://restcountries.com/v3.1/lang/spanish',
        method: 'GET',
        success: function (data) {
            $('#selectCountry').empty();
            $('#selectCountry').append('<option value="">Seleccione Pais</option>');

            data.forEach(function (country) {
                const countryName = country.name.nativeName.spa.official;

                $('#selectCountry').append(`<option value="${countryName}">${countryName}</option>`);
            })

            $('#otherCountry').remove();
        },
        error: function () {
            alert("No se pudo cargar la lista de paises");
            $('#selectCountry').remove();
            $('#otherCountry').show();
        }
    });

    //Validación de correo electronico
    $('#formEmail').on('input', function () {
        const email = $(this).val().trim();
        const esValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!esValido) {
            $(this).addClass('is-invalid').removeClass('is-valid');
        } else {
            $(this).addClass('is-valid').removeClass('is-invalid');
        }
    });

    //Contar caracteres de comentario / mensaje
    $('#formComent').on('input', function () {
        let text = $(this).val();
        let cant = text.length;
        let max = $(this).attr('maxlength') || 120;

        if (cant > 120) {
            $(this).addClass('is-invalid').removeClass('is-valid');
        } else {
            $(this).removeClass('is-invalid');
        }

        $('#charCount').text(`${cant} / ${max} caracteres`);
    });

    //Validación que campos obligatorios no esten vacios
    $('button[type="submit"]').on('click', function (e) {
        let errores = [];
        let name = $('#formName').val();
        let email = $('#formEmail').val();
        let country = $('#selectCountry option:selected').val();
        let number = $('#formNumber').val().trim();
        let coment = $('#formComent').val();
        

        if (name == '') {
            errores.push("Agregue su nombre");
            $('#formName').addClass('is-invalid').removeClass('is-valid');
        } else {
            $('#formName').addClass('is-valid').removeClass('is-invalid');
        }

        if (email == '') {
            errores.push("Agregue su correo electrónico");
            $('#formEmail').addClass('is-invalid').removeClass('is-valid');
        } else {
            let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!regex.test(email)) {
                errores.push("El email no tiene el formato válido");
                $('#formEmail').addClass('is-valid').removeClass('is-invalid');
            }
        }

        if (country == '') {
            errores.push("Seleccione un país");
            $('#selectCountry').addClass('is-invalid').removeClass('is-valid');
        } else {
            $('#selectCountry').addClass('is-valid').removeClass('is-invalid');
        }

        if (number == '') {
            errores.push("Agregue un número de telefono");
            $('#formNumber').addClass('is-invalid').removeClass('is-valid');
        } else {
            if (number.length > 9 || number.length < 9) {
                $('#formNumber').addClass('is-invalid').removeClass('is-valid');
                errores.push("El número no es valido")
            } else {
                $('#formNumber').addClass('is-valid').removeClass('is-invalid');
            }
        }

        if (coment == '') {
            errores.push("Agregue un mensaje o comentario");
            $('#formComent').addClass('is-invalid').removeClass('is-valid');
        } else {
            $('#formComent').addClass('is-valid').removeClass('is-invalid');
        }

        if (errores.length > 0) {
            $('#lista-errores').empty();
            e.preventDefault();

            errores.forEach(function (error) {
                $('#lista-errores').append('<li>' + error + '</li>');
            });

            $('#div-errores').show();
            errores.empty();
        } else {
            const nuevoContacto = {
                id: Date.now(),
                nombre: name,
                email: email,
                celular: number,
                pais: country,
                comentarios: coment
            }

            dataBase.push(nuevoContacto)
            localStorage.setItem("contactos", JSON.stringify(dataBase));
            $('input, #textareaComentario, select').val('');
        }
    });

    //Eliminar un usuario
    $('#tabla-contactos').on('click', '.eliminar', function () {
        const id = $(this).closest('tr').data('id');                            
        let dataBase = JSON.parse(localStorage.getItem("contactos")) || [];
        dataBase = dataBase.filter(contacto => contacto.id !== id);             
        localStorage.setItem("contactos", JSON.stringify(dataBase));
        location.reload(); // recarga para actualizar la tabla
    });

    //Editar un usuario
    $('#tabla-contactos').on('click', '.editar', function () {
        const fila = $(this).closest('tr');
        const id = fila.data('id');
        const contacto = dataBase.find(c => c.id === id);

        $('#formName').val(contacto.nombre);
        $('#formEmail').val(contacto.email);
        $('#formNumber').val(contacto.celular);
        $('#selectCountry').val(contacto.pais);
        $('#formComent').val(contacto.comentarios);

        $('#formName').data('edit-id', id);
    });

    //Guardar los cambios
    let editId = $('#formName').data('edit-id');
    if (editId) {
        const index = dataBase.findIndex(c => c.id === editId);
        dataBase[index] = {
            id: editId,
            nombre: name,
            email: email,
            celular: number,
            pais: country,
            comentarios: coment
        };

        $('#formName').removeData('edit-id');
    } else {
        const nuevoContacto = { id: Date.now(), nombre: name, email, celular: number, pais: country, comentarios: coment };
        dataBase.push(nuevoContacto);
    }
    localStorage.setItem("contactos", JSON.stringify(dataBase));
    location.reload();

});