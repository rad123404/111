const DEFAULT_SCHEDULES = {
  "math": {
    "title": "Математика",
    "pn": ["География", "Алгебра", "Геометрия", "Физкультура", "Русская литература", "Химия"],
    "vt": ["История", "Физика", "Иностранный язык", "Информатика", "Белорусский язык", "Белорусская литература", "Классный час"],
    "sr": ["Астрономия", "Биология", "Химия", "Иностранный язык", "Физика", "Алгебра", "Геометрия"],
    "cht": ["1. Русский язык", "2. Алгебра", "3. История", "4. Физкультура", "5. Белорусский язык", "6. Русская литература", "7. Русский язык", "8. Инф. час"],
    "pt": ["2. Физкультура", "3. Биология", "4. Обществоведение", "5. Доприз/Мед", "6. Русский язык", "7. Алгебра"]
  },
  "chem": {
    "title": "Химия",
    "pn": ["Алгебра", "География", "Химия", "Химия", "Физкультура", "Русская литература"],
    "vt": ["Алгебра", "История", "Физика", "Иностранный язык", "Химия", "Белорусский язык", "Белорусская литература", "Классный час"],
    "sr": ["Геометрия", "Астрономия", "Биология", "Информатика", "Иностранный язык", "Физика"],
    "cht": ["Русский язык", "Химия", "История", "Физкультура", "Белорусский язык", "Русская литература", "Русский язык", "Инф. час"],
    "pt": ["Геометрия", "Физкультура", "Биология", "Обществоведение", "Доприз/Мед", "Русский язык"]
  },
  "base": {
    "title": "База",
    "pn": ["Алгебра", "География", "Физкультура", "Русская литература", "Химия"],
    "vt": ["Алгебра", "История", "Физика", "Иностранный язык", "Информатика", "Белорусский язык", "Белорусская литература", "Классный час"],
    "sr": ["Геометрия", "Астрономия", "Биология", "Химия", "Иностранный язык", "Физика"],
    "cht": ["Русский язык", "История", "Физкультура", "Белорусский язык", "Русская литература", "Инф. час"],
    "pt": ["Геометрия", "Физкультура", "Биология", "Обществоведение", "Доприз/Мед"]
  }
};

const DEFAULT_DATA = {
  schedules: DEFAULT_SCHEDULES,
  hw: {
    "math": [{ id: "1", text: "Стр. 42, №5-8, выучить правило", due: new Date(Date.now()+86400000).toISOString().slice(0,10), created: new Date().toISOString().slice(0,10) }]
  },
  events: [
    { id: '1', title: 'Классный час', date: new Date().toISOString().slice(0,10), time: '14:40' }
  ],
  duties: {
    "pn": ["Иванова Настя", "Дятлов Влад"],
    "vt": ["Комар Влад", "Щербич Вика"],
    "sr": ["Самойлов Витя", "Овсяник Стеша"],
    "cht": ["Дятлов Влад", "Комар Влад"],
    "pt": ["Иванова Настя", "Самойлов Витя"]
  },
  birthdays: [
    { name: "Дятлов Влад", date: "12.01" },
    { name: "Комар Влад", date: "23.02" },
    { name: "Иванова Настя", date: "14.05" },
    { name: "Щербич Вика", date: "15.09" },
    { name: "Самойлов Витя", date: "11.11" },
    { name: "Овсяник Стеша", date: "20.10" }
  ],
  poll_active: false,
  poll_history: [],
  current_poll: {
    id: "poll_init",
    created: new Date().toISOString().slice(0,10),
    date: new Date().toISOString().slice(0,10),
    eat: 0, no: 0, abs: 0, voters: []
  }
};

// Резервная память воркера, если KV еще не привязан локально
let memoryFallback = null;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/data') {
      let currentData = null;

      // 1. Попытка прочитать из Cloudflare KV
      if (env.CLASS_DATA_KV) {
        try {
          const raw = await env.CLASS_DATA_KV.get('shared_data');
          if (raw) currentData = JSON.parse(raw);
        } catch(e) {
          console.error("KV Read Error:", e);
        }
      }

      if (!currentData) {
        currentData = memoryFallback || DEFAULT_DATA;
      }

      // 2. Запись данных (POST)
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          currentData = { ...currentData, ...body };

          if (env.CLASS_DATA_KV) {
            await env.CLASS_DATA_KV.put('shared_data', JSON.stringify(currentData));
          }
          memoryFallback = currentData;

          return new Response(JSON.stringify({ success: true, data: currentData }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*' 
            }
          });
        } catch(e) {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
        }
      } 
      
      // 3. Чтение данных (GET)
      else {
        return new Response(JSON.stringify(currentData), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          }
        });
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  }
};
