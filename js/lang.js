document.addEventListener('DOMContentLoaded', () => {
    // .lang-options内のli要素を取得
    const langOptions = document.querySelectorAll('.lang-options li');
    
    langOptions.forEach(li => {
        // data-lang属性から言語コードを取得
        const langCode = li.getAttribute('data-lang');
        
        // JS側でIDをそれぞれにふる
        if (langCode) {
            li.id = langCode;
            
            // クリックイベントを設定
            li.addEventListener('click', () => {
                // setLanguage('言語ID')で動かせるようにする
                if (typeof setLanguage === 'function') {
                    setLanguage(li.id);
                }
            });
        }
    });
});
