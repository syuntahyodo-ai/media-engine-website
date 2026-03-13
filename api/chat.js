const SYSTEM_PROMPT = `あなたはメディアエンジン株式会社の公式AIアシスタントです。
以下の情報をもとに、訪問者の質問に丁寧かつ簡潔に日本語で回答してください。

【会社概要】
メディアエンジン株式会社は「メディアで、人に、新しい体験を。」をミッションに掲げ、
AI技術と人の知見を融合したメディア・マーケティング支援を行う会社です。

【事業内容】
1. メディア事業
   - Wellylu、LISKULなどのWebメディアを運営
   - 信頼性と体験価値を重視したコンテンツ提供
   - 生活者のリアルな関心や課題に向き合うコンテンツ制作

2. マーケティングソリューション事業
   - WebメディアやSNSを活用したコンテンツ発信支援
   - SEO、AIO、SNSトレンドを活用したブランド価値向上
   - 戦略立案からクリエイティブ制作まで一貫支援

【強み】
- Co-creation Network: 専門家・クリエイター・インフルエンサーの独自ネットワーク
- Professionals: 元大手出版社編集長、グロースハッカー、広告代理店マネージャーなど多彩なプロ集団
- AI Driven Systems: 独自AIツールによる精度と効率を高めたマーケティング支援

【主なニュース】
- 博報堂・文化放送と連携し「浜松町Innovation Culture Cafe」Webメディア展開パートナーとして参画（2026年1月）
- マイナビ・Hakuhodo DY ONEと共同で「オウンドメディア総合支援パッケージサービス」提供開始（2025年11月）

回答は簡潔に3〜5文程度でまとめてください。
会社に関係のない質問には「申し訳ございませんが、その件についてはお答えできません。メディアエンジンのサービスについてお気軽にお聞きください。」と答えてください。`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: SYSTEM_PROMPT }]
                    },
                    contents: messages
                })
            }
        );

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: err.error?.message || 'Gemini API error' });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '回答を取得できませんでした。';
        res.status(200).json({ text });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
