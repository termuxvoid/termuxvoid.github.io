document.addEventListener('DOMContentLoaded', function() {
    // Terminal typing animation
    const commands = document.querySelectorAll('.command');
    
    commands.forEach(command => {
        const text = command.textContent;
        command.textContent = '';
        
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                command.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, 50);
    });
    
    // Add blinking cursor effect
    const prompts = document.querySelectorAll('.prompt');
    
    prompts.forEach(prompt => {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '_';
        prompt.appendChild(cursor);
        
        setInterval(() => {
            cursor.style.visibility = cursor.style.visibility === 'hidden' ? 'visible' : 'hidden';
        }, 500);
    });
    
    // Add click to copy functionality for commands
    commands.forEach(command => {
        command.addEventListener('click', function() {
            const textToCopy = this.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        });
    });
});