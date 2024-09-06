// menu

const button = document.querySelector(".li-menu .menu");
const menu = document.querySelector(".responsive-itens-container");
const boby = document.querySelector("body");

if (!menu) {
    if (button) {
        button.remove();
    }
} else {
    const e = () => {

        if (menu) {
            menu.classList.toggle("activated");
            boby.classList.toggle("overflow")
        }
    }

    button.addEventListener("click", e);
};

// dropdown

const perfil = document.querySelector(".li-dropdown-header .dropdown");
const dropdown = document.querySelector(".dropdown-content");

if (perfil && dropdown) {
    const f = () => {
        dropdown.classList.toggle("onBlock")
    }

    perfil.addEventListener("click", f);
};

// notification

const notify = document.querySelector(".li-dropdown-header .dropdown-notification");
const Ndropdown = document.querySelector(".dropdown-notification-content");

if (notify && Ndropdown) {
    const g = () => {
        Ndropdown.classList.toggle("onBlock")
    }

    notify.addEventListener("click", g);
};

// menu itens

const dots = document.querySelectorAll(".more-icon");

if (dots.length > 0) {
    const d = (event) => {
        const dot = event.currentTarget;
        const menu = dot.querySelector(".dropdown-content");

        // Verifica se o menu existe antes de tentar alterar seu estilo
        if (menu) {
            menu.classList.toggle("onBlock");
        }
    };

    dots.forEach((dot) => dot.addEventListener("click", d));
}

// categorias da loja

function handleChange(select, action) {
    const category = select.value;

    window.location.href = `/${action}?category=` + category;
}
// troca de aba do perfil

function tabToggle(tabName) {
    // model viewer
    const modelBtn = document.querySelector('.modelButton');
    const inventoryBtn = document.querySelector('.inventoryButton');
    const modelContent = document.querySelector('.model-content');
    const inventoryContent = document.querySelector('.inventory-viewer');

    if (modelContent || inventoryContent) {
        modelBtn.classList.toggle('active');
        inventoryBtn.classList.toggle('active');
    }
    if (modelContent) {
        modelContent.style.display = tabName === 'model' ? 'block' : 'none';
    }
    if (inventoryContent) {
        inventoryContent.style.display = tabName === 'inventory' ? 'flex' : 'none';
    }

}

// modal toggle

function toggleModal() {
    const backgroundModal = document.querySelector(".modal-background");

    if (backgroundModal) {
        backgroundModal.classList.toggle("show")
        // body
        boby.classList.toggle("overflow")
    }
}

function modaltabToggle(tabName) {
    // modal
    const followersBtn = document.querySelector('.followersButton');
    const followingBtn = document.querySelector('.followingButton');
    const followersContent = document.querySelector('.followers');
    const followingContent = document.querySelector('.following');

    if (followersContent || followingContent) {
        followersBtn.classList.toggle('active');
        followingBtn.classList.toggle('active');
    }
    if (followersContent) {
        followersContent.style.display = tabName === 'followers' ? 'block' : 'none';
    }
    if (followingContent) {
        followingContent.style.display = tabName === 'following' ? 'block' : 'none';
    }
}

// proibir copiar e colar

function blockCopyAndPaste(inputElement) {
    // Desabilitar a capacidade de colar texto no input
    inputElement.addEventListener('paste', function (event) {
        event.preventDefault();
        return false;
    });

    // Desabilitar a capacidade de copiar texto do input
    inputElement.addEventListener('copy', function (event) {
        event.preventDefault();
        return false;
    });

    // Desabilitar a capacidade de cortar texto do input
    inputElement.addEventListener('cut', function (event) {
        event.preventDefault();
        return false;
    });
}
// desabilitar span de submit no form

document.addEventListener('DOMContentLoaded', (event) => {
    const forms = document.querySelectorAll('form');

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
            }
        });
    });
});

// jquery

// previw de imagens

function previewImage(input, imageClass) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('.' + imageClass).attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
};

function previewImageForPublication(input) {
    const file = input.files[0];
    const container = document.getElementById('imagePreviewContainer');

    // Limpa o container antes de adicionar uma nova imagem
    container.innerHTML = '';

    if (file) {
        const reader = new FileReader();
        const img = document.createElement('img');

        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        reader.onload = function (e) {
            img.src = e.target.result;
            container.appendChild(img); // Adiciona a imagem ao container
        }

        reader.readAsDataURL(file);
    }
}

function removeImage() {
    const input = document.getElementById('imageUpload');
    const container = document.getElementById('imagePreviewContainer');

    // Limpa o container de imagem
    container.innerHTML = '';

    // Limpa o valor do input
    input.value = '';

    // Envia uma solicitação para limpar a imagem da sessão
    fetch('/remove-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ remove: true })
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Imagem removida com sucesso');
            } else {
                console.log('Erro ao remover imagem');
            }
        });
}

// modal de boas vindas

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('welcome-modal');

    // Verifica se o usuário já viu o modal antes
    if (!localStorage.getItem('modalSeen')) {
        modal.style.display = 'flex'; // Exibe o modal
        document.getElementById('phase-1').style.display = 'block'; // Mostra a primeira fase
    }
});

// Função para passar para a próxima fase
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('welcome-modal');
    const phases = document.querySelectorAll('.modal-phase');
    
    // Inicializa o indicador de progresso
    initializeProgressIndicator(phases.length);

    // Verifica se o usuário já viu o modal antes
    if (!localStorage.getItem('modalSeen')) {
        modal.style.display = 'flex'; // Exibe o modal
        phases[0].style.display = 'block'; // Mostra a primeira fase
    }
});

// Função para inicializar o indicador de progresso
function initializeProgressIndicator(numPhases) {
    const progressIndicator = document.getElementById('progress-indicator');
    for (let i = 1; i <= numPhases; i++) {
        const dot = document.createElement('span');
        dot.id = `progress-${i}`;
        dot.className = 'progress-dot';
        if (i === 1) dot.classList.add('active'); // Marca a primeira fase como ativa
        progressIndicator.appendChild(dot);
    }
}

// Função para passar para a próxima fase
function nextPhase(phase) {
    const phases = document.querySelectorAll('.modal-phase');
    // Esconde todas as fases
    phases.forEach(element => element.style.display = 'none');
    // Mostra a fase específica
    document.getElementById(`phase-${phase}`).style.display = 'block';
    updateProgress(phase);
}

// Função para voltar à fase anterior
function prevPhase(phase) {
    const phases = document.querySelectorAll('.modal-phase');
    // Esconde todas as fases
    phases.forEach(element => element.style.display = 'none');
    // Mostra a fase específica
    document.getElementById(`phase-${phase}`).style.display = 'block';
    updateProgress(phase);
}

// Função para atualizar o indicador de progresso
function updateProgress(currentPhase) {
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        if (index < currentPhase) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Função para fechar o modal e salvar no localStorage
function closeModal() {
    document.getElementById('welcome-modal').style.display = 'none';
}
