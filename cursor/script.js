document.addEventListener('DOMContentLoaded', (event) => {
    // API密钥（注意：在实际生产环境中应该将此密钥保存在服务器端）
    const API_KEY = "5e3dbc3a10340b123269807268e4607d.bNrd6tZwfsRDNpGC";

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 联系表单提交
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('感谢您的留言！我们会尽快回复您。');
        this.reset();
    });

    // AI聊天功能
    const chatInput = document.getElementById('ai-chat-input');
    const chatSend = document.getElementById('ai-chat-send');
    const chatMessages = document.getElementById('ai-chat-messages');

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            appendMessage('user', message);
            chatInput.value = '';
            try {
                const response = await getAIResponse(message);
                appendMessage('ai', response);
            } catch (error) {
                console.error('Error:', error);
                appendMessage('ai', '抱歉，我遇到了一些问题。请稍后再试。');
            }
        }
    }

    function appendMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(sender);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 生成JWT token
    function generateToken(apiKey) {
        const [id, secret] = apiKey.split('.');
        const header = btoa(JSON.stringify({ alg: "HS256", sign_type: "SIGN" }));
        const payload = btoa(JSON.stringify({
            api_key: id,
            exp: Date.now() + 3600000,
            timestamp: Date.now()
        }));
        
        const signature = CryptoJS.HmacSHA256(`${header}.${payload}`, secret);
        const signatureBase64 = CryptoJS.enc.Base64.stringify(signature);
        
        return `${header}.${payload}.${signatureBase64}`;
    }

    async function getAIResponse(message) {
        const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        const token = generateToken(API_KEY);
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const data = {
            model: "glm-4",
            messages: [
                {
                    role: "system",
                    content: "你是一个友好的AI助手，负责回答关于这个个人网站的问题。请提供简洁、准确的回答。"
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1024
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('API Response:', result); // 添加这行来记录完整的API响应

            if (result.choices && result.choices.length > 0 && result.choices[0].message) {
                return result.choices[0].message.content;
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Error details:', error);
            return '抱歉，我遇到了一些问题。请稍后再试。';
        }
    }

    // 轮播功能代码保持不变
});