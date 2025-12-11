const fs = require('fs');
const path = require('path');

// 数据存储路径
const DATA_PATH = path.join(process.cwd(), 'data.json');

// 确保数据文件存在
function ensureDataFile() {
    if (!fs.existsSync(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, JSON.stringify({
            contestants: [],
            scores: {},
            judges: [],
            onlineJudges: []
        }));
    }
}

module.exports = async (req, res) => {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    ensureDataFile();
    
    try {
        if (req.method === 'GET' && req.query.action === 'load') {
            // 读取数据
            const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
            return res.json({ success: true, ...data });
        }
        
        if (req.method === 'POST' && req.query.action === 'save') {
            // 保存数据
            const data = req.body;
            fs.writeFileSync(DATA_PATH, JSON.stringify(data));
            return res.json({ success: true });
        }
        
        return res.status(400).json({ success: false, message: '无效请求' });
    } catch (error) {
        console.error('数据操作错误:', error);
        return res.status(500).json({ success: false, message: '服务器错误' });
    }
};