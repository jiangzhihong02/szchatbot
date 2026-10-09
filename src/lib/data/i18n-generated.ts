/**
 * 內容數據的三語譯文疊加層（票 11 第二批）。
 *
 * 繁體（正本）在 `lib/data/*`，本檔只放 `zh-Hans` 與 `en`。
 * 鍵格式見 `src/lib/i18n/content.ts` 的 kRoute / kStop / kFood / kDeal。
 *
 * 產出來源：原定用 LLM 端點起草，但該端點有 Cloudflare 120 秒來源逾時、
 * 單次回應極慢且會限流（見 scripts/gen-translations.ts 的註記），
 * 故改為**由 Claude 直接撰寫並校對**。`scripts/build-i18n-data.ts` 仍可用於
 * 從草稿重新生成（若日後換了穩定的端點）。
 *
 * 英文地名格式：羅馬拼音 + 英文通名 +（簡體中文），讓旅客能念、也能出示給本地人看。
 */
export const CONTENT_I18N: Record<string, { "zh-Hans": string; en: string }> = {
  // ── 路線 routes ──────────────────────────────────────────
  "foodie-old-town.title": { "zh-Hans": "罗湖老城觅食一日游", en: "Luohu Old Town Food Crawl" },
  "foodie-old-town.theme": { "zh-Hans": "美食", en: "Food" },
  "foodie-old-town.area": { "zh-Hans": "罗湖", en: "Luohu" },
  "foodie-old-town.bestFor": {
    "zh-Hans": "情侣 / 三五好友、吃货、想一次尝多种小吃",
    en: "Couples or small groups of friends, foodies, anyone wanting to sample many snacks at once",
  },
  "foodie-old-town.tips": {
    "zh-Hans": "避开 12:00–14:00 和 18:00–20:00 两个高峰；东门小吃多为一人份，建议 3–4 人分着吃、多试几样。",
    en: "Skip the 12:00–14:00 and 18:00–20:00 peaks; most Dongmen snacks come in single portions, so 3–4 people can share and try more.",
  },
  "foodie-old-town.stop0.name": {
    "zh-Hans": "东门老街 / 东门町美食街",
    en: "Dongmen Old Street / Dongmenting Food Street（东门老街 / 东门町美食街）",
  },
  "foodie-old-town.stop0.area": { "zh-Hans": "罗湖", en: "Luohu" },
  "foodie-old-town.stop0.desc": {
    "zh-Hans": "老街牌坊、骑楼街景；东门町聚集牛杂、烤生蚝、肠粉、糖水等小吃",
    en: "Old-street archways and arcaded shopfronts; Dongmenting packs in beef offal, grilled oysters, rice rolls and sweet soups",
  },
  "foodie-old-town.stop1.name": { "zh-Hans": "向西村 / 蔡屋围", en: "Xiangxi Village / Caiwuwei（向西村 / 蔡屋围）" },
  "foodie-old-town.stop1.area": { "zh-Hans": "罗湖", en: "Luohu" },
  "foodie-old-town.stop1.desc": {
    "zh-Hans": "潮汕砂锅粥、卤水拼盘、烧腊；本地人夜宵场",
    en: "Chaoshan claypot congee, braised platters and roast meats — a locals' late-night haunt",
  },
  "foodie-old-town.stop2.name": { "zh-Hans": "罗湖万象城", en: "Luohu MixC Mall（罗湖万象城）" },
  "foodie-old-town.stop2.area": { "zh-Hans": "罗湖", en: "Luohu" },
  "foodie-old-town.stop2.desc": {
    "zh-Hans": "饭后逛商场、买伴手礼（Ole' 超市）；地铁大剧院站直达",
    en: "Shop and pick up gifts (Ole' supermarket); direct from Grand Theater metro station",
  },
  "foodie-old-town.stop3.name": { "zh-Hans": "KK TIME / 万象食家", en: "KK TIME / Wanxiang Shijia（KK TIME / 万象食家）" },
  "foodie-old-town.stop3.area": { "zh-Hans": "罗湖", en: "Luohu" },
  "foodie-old-town.stop3.desc": {
    "zh-Hans": "新式餐饮楼层，可以当夜宵或甜品收尾",
    en: "A modern dining floor — good for a late bite or dessert to finish",
  },

  "art-coastal.title": { "zh-Hans": "蛇口文艺海滨慢行（半日）", en: "Shekou Seaside Art Stroll (half day)" },
  "art-coastal.theme": { "zh-Hans": "文艺", en: "Arts" },
  "art-coastal.area": { "zh-Hans": "南山", en: "Nanshan" },
  "art-coastal.bestFor": {
    "zh-Hans": "情侣、喜欢拍照和设计展的朋友",
    en: "Couples, and anyone into photography or design exhibitions",
  },
  "art-coastal.tips": {
    "zh-Hans": "建议下午 3 点后出发，看完展正好赶上日落和海上世界音乐喷泉；喷泉一般 19:00–22:00 每半小时一场。",
    en: "Head out after 3pm — you'll finish the exhibitions just in time for sunset and the Sea World fountain show (usually every half hour, 19:00–22:00).",
  },
  "art-coastal.stop0.name": {
    "zh-Hans": "海上世界文化艺术中心（设计互联）",
    en: "Sea World Culture and Arts Center (Design Society)（海上世界文化艺术中心）",
  },
  "art-coastal.stop0.area": { "zh-Hans": "南山", en: "Nanshan" },
  "art-coastal.stop0.desc": {
    "zh-Hans": "海景建筑、设计与当代艺术展、海景书店",
    en: "Seafront architecture, design and contemporary art shows, and a sea-view bookshop",
  },
  "art-coastal.stop1.name": { "zh-Hans": "明华轮 / 海上世界广场", en: "Minghua Ship / Sea World Plaza（明华轮 / 海上世界广场）" },
  "art-coastal.stop1.area": { "zh-Hans": "南山", en: "Nanshan" },
  "art-coastal.stop1.desc": {
    "zh-Hans": "地标邮轮、喷泉表演、露天餐饮",
    en: "The landmark ship, fountain shows and open-air dining",
  },
  "art-coastal.stop2.name": {
    "zh-Hans": "蛇口渔街 / 海上世界食街",
    en: "Shekou Fish Street / Sea World Food Street（蛇口渔街 / 海上世界食街）",
  },
  "art-coastal.stop2.area": { "zh-Hans": "南山", en: "Nanshan" },
  "art-coastal.stop2.desc": {
    "zh-Hans": "海鲜晚餐：砂锅粥、蒸海鲜、生蚝",
    en: "Seafood dinner: claypot congee, steamed seafood, oysters",
  },
  "art-coastal.stop3.name": { "zh-Hans": "蛇口邮轮母港 / K11 ECOAST", en: "Shekou Cruise Terminal / K11 ECOAST（蛇口邮轮母港）" },
  "art-coastal.stop3.area": { "zh-Hans": "南山", en: "Nanshan" },
  "art-coastal.stop3.desc": {
    "zh-Hans": "海滨散步和新商场（K11 ECOAST 一带）",
    en: "A seaside walk and a new mall around K11 ECOAST",
  },

  "hakka-longgang.title": { "zh-Hans": "龙岗客家古镇一日游", en: "Longgang Hakka Old Town Day Trip" },
  "hakka-longgang.theme": { "zh-Hans": "文化", en: "Culture" },
  "hakka-longgang.area": { "zh-Hans": "龙岗", en: "Longgang" },
  "hakka-longgang.bestFor": {
    "zh-Hans": "想避开人潮、喜欢古村和客家菜的家庭、长辈同行",
    en: "Families and older visitors who want to dodge the crowds, plus Hakka food",
  },
  "hakka-longgang.tips": {
    "zh-Hans": "甘坑古镇街区免费、全天开放；地铁 10 号线甘坑站 B 出口步行约 15 分钟。个别场馆（二十四史书院、凤凰谷）另收费。",
    en: "The Gankeng old-town streets are free and open all day; about 15 minutes on foot from Gankeng station (Line 10), exit B. A few venues (Academy of the Twenty-Four Histories, Phoenix Valley) charge separately.",
  },
  "hakka-longgang.stop0.name": { "zh-Hans": "甘坑客家小镇（甘坑古镇）", en: "Gankeng Hakka Town（甘坑客家小镇）" },
  "hakka-longgang.stop0.area": { "zh-Hans": "龙岗", en: "Longgang" },
  "hakka-longgang.stop0.desc": {
    "zh-Hans": "客家围村、灯笼街、文创小店；国家 3A 级景区，街区免费",
    en: "Hakka walled village, lantern street and craft shops; a national 3A site, free to wander",
  },
  "hakka-longgang.stop1.name": { "zh-Hans": "甘坑客家菜餐厅", en: "Gankeng Hakka restaurants（甘坑客家菜）" },
  "hakka-longgang.stop1.area": { "zh-Hans": "龙岗", en: "Longgang" },
  "hakka-longgang.stop1.desc": {
    "zh-Hans": "盐焗鸡、客家酿豆腐、梅菜扣肉、窑鸡",
    en: "Salt-baked chicken, stuffed tofu, pork with preserved mustard greens, kiln chicken",
  },
  "hakka-longgang.stop2.name": { "zh-Hans": "大芬油画村", en: "Dafen Oil Painting Village（大芬油画村）" },
  "hakka-longgang.stop2.area": { "zh-Hans": "龙岗", en: "Longgang" },
  "hakka-longgang.stop2.desc": {
    "zh-Hans": "油画街区、画廊，可以定制画作；免费",
    en: "Painting studios and galleries; you can commission a portrait — free to enter",
  },

  "east-coast-dapeng.title": { "zh-Hans": "东部海岸大鹏一日游", en: "Dapeng East Coast Day Trip" },
  "east-coast-dapeng.theme": { "zh-Hans": "海岸", en: "Coast" },
  "east-coast-dapeng.area": { "zh-Hans": "大鹏新区 / 盐田", en: "Dapeng New District / Yantian" },
  "east-coast-dapeng.bestFor": {
    "zh-Hans": "喜欢海、想逃离市区的年轻人和家庭（建议自驾或报一日团）",
    en: "Young people and families craving the sea and a break from the city (driving or a day tour recommended)",
  },
  "east-coast-dapeng.tips": {
    "zh-Hans": "路程远，回程容易堵车。地铁 2/8 号线已延伸到溪涌站（2025 年底通车），再转公交进大鹏。较场尾沙滩有急流、没有救生员，不要下水。",
    en: "It's a long haul and the drive back can jam. Metro Lines 2/8 now reach Xichong (opened late 2025), then take a bus into Dapeng. Jiaochangwei beach has rip currents and no lifeguards — don't swim.",
  },
  "east-coast-dapeng.stop0.name": { "zh-Hans": "大鹏所城", en: "Dapeng Fortress（大鹏所城）" },
  "east-coast-dapeng.stop0.area": { "zh-Hans": "大鹏", en: "Dapeng" },
  "east-coast-dapeng.stop0.desc": {
    "zh-Hans": "明清海防古城、将军府；免费",
    en: "A Ming–Qing coastal defence town with a generals' residence — free",
  },
  "east-coast-dapeng.stop1.name": { "zh-Hans": "较场尾", en: "Jiaochangwei（较场尾）" },
  "east-coast-dapeng.stop1.area": { "zh-Hans": "大鹏", en: "Dapeng" },
  "east-coast-dapeng.stop1.desc": {
    "zh-Hans": "海边民宿群、沙滩日落；免费",
    en: "Beachside guesthouses and sunset on the sand — free",
  },
  "east-coast-dapeng.stop2.name": { "zh-Hans": "南澳海鲜 / 杨梅坑", en: "Nan'ao Seafood / Yangmeikeng（南澳海鲜 / 杨梅坑）" },
  "east-coast-dapeng.stop2.area": { "zh-Hans": "大鹏", en: "Dapeng" },
  "east-coast-dapeng.stop2.desc": {
    "zh-Hans": "南澳海鲜街；杨梅坑免费，可以海滨骑行",
    en: "Nan'ao seafood street; Yangmeikeng is free and good for a coastal bike ride",
  },
  "east-coast-dapeng.stop3.name": {
    "zh-Hans": "盐田海鲜街 / 大小梅沙",
    en: "Yantian Seafood Street / Dameisha & Xiaomeisha（盐田海鲜街 / 大小梅沙）",
  },
  "east-coast-dapeng.stop3.area": { "zh-Hans": "盐田", en: "Yantian" },
  "east-coast-dapeng.stop3.desc": {
    "zh-Hans": "回程顺路的海鲜街和海滨公园",
    en: "A seafood street and seaside park on the way back",
  },

  "halfday-futian-cbd.title": { "zh-Hans": "福田 CBD 半日：展览 + 商圈", en: "Futian CBD Half Day: Museums + Malls" },
  "halfday-futian-cbd.theme": { "zh-Hans": "文艺", en: "Arts" },
  "halfday-futian-cbd.area": { "zh-Hans": "福田", en: "Futian" },
  "halfday-futian-cbd.bestFor": {
    "zh-Hans": "从福田口岸过关、只有半日时间的旅客",
    en: "Visitors crossing at Futian Port with only half a day",
  },
  "halfday-futian-cbd.tips": {
    "zh-Hans": "深圳市当代艺术与城市规划馆免门票、免预约，逢周一闭馆；旁边就是市民中心和莲花山公园。",
    en: "The Museum of Contemporary Art and Urban Planning is free, needs no booking, and closes Mondays; the Civic Center and Lianhuashan Park are right next door.",
  },
  "halfday-futian-cbd.stop0.name": {
    "zh-Hans": "深圳市当代艺术与城市规划馆",
    en: "Museum of Contemporary Art and Urban Planning（当代艺术与城市规划馆）",
  },
  "halfday-futian-cbd.stop0.area": { "zh-Hans": "福田", en: "Futian" },
  "halfday-futian-cbd.stop0.desc": {
    "zh-Hans": "免费常设展（城市规划、改革开放展）；周一闭馆",
    en: "Free permanent exhibitions on urban planning and reform-era history; closed Mondays",
  },
  "halfday-futian-cbd.stop1.name": { "zh-Hans": "莲花山公园", en: "Lianhuashan Park（莲花山公园）" },
  "halfday-futian-cbd.stop1.area": { "zh-Hans": "福田", en: "Futian" },
  "halfday-futian-cbd.stop1.desc": {
    "zh-Hans": "登顶看福田 CBD 天际线；免费",
    en: "Climb to the top for the Futian CBD skyline — free",
  },
  "halfday-futian-cbd.stop2.name": { "zh-Hans": "COCO Park / 卓悦中心", en: "COCO Park / One Avenue（COCO Park / 卓悦中心）" },
  "halfday-futian-cbd.stop2.area": { "zh-Hans": "福田", en: "Futian" },
  "halfday-futian-cbd.stop2.desc": {
    "zh-Hans": "晚餐、天台酒吧、茑屋书店",
    en: "Dinner, rooftop bars and a Tsutaya bookshop",
  },

  "family-safari-park.title": { "zh-Hans": "南山亲子主题乐园日", en: "Nanshan Family Theme Park Day" },
  "family-safari-park.theme": { "zh-Hans": "亲子", en: "Family" },
  "family-safari-park.area": { "zh-Hans": "南山", en: "Nanshan" },
  "family-safari-park.bestFor": { "zh-Hans": "带 3–12 岁小孩的家庭", en: "Families with kids aged 3–12" },
  "family-safari-park.tips": {
    "zh-Hans": "乐园门票提前在网上买通常比现场便宜，还能免排队；带上防晒、帽子和小孩的水壶。1.2 米以下儿童多数乐园免费。",
    en: "Buying tickets online in advance is usually cheaper than at the gate and skips the queue; bring sun cream, hats and a water bottle for the kids. Most parks are free for children under 1.2m.",
  },
  "family-safari-park.stop0.name": { "zh-Hans": "深圳野生动物园", en: "Shenzhen Safari Park（深圳野生动物园）" },
  "family-safari-park.stop0.area": { "zh-Hans": "南山", en: "Nanshan" },
  "family-safari-park.stop0.desc": {
    "zh-Hans": "放养式动物园，有海洋动物馆和游乐区；09:30–18:00",
    en: "A free-range zoo with a marine hall and rides; 09:30–18:00",
  },
  "family-safari-park.stop1.name": { "zh-Hans": "欢乐海岸", en: "Happy Coast（欢乐海岸）" },
  "family-safari-park.stop1.area": { "zh-Hans": "南山", en: "Nanshan" },
  "family-safari-park.stop1.desc": {
    "zh-Hans": "海滨餐饮街 + 水舞灯光秀，适合午餐和傍晚散步",
    en: "A waterfront dining street plus a water-and-light show — good for lunch and an evening stroll",
  },
  "family-safari-park.stop2.name": { "zh-Hans": "深圳人才公园", en: "Shenzhen Talent Park（深圳人才公园）" },
  "family-safari-park.stop2.area": { "zh-Hans": "南山", en: "Nanshan" },
  "family-safari-park.stop2.desc": {
    "zh-Hans": "看深圳湾夜景、看春笋大厦灯光，免费",
    en: "Shenzhen Bay views and the lit-up Spring Bamboo tower — free",
  },

  "family-happy-valley.title": { "zh-Hans": "华侨城亲子机动游戏日", en: "OCT Family Ride Day" },
  "family-happy-valley.theme": { "zh-Hans": "亲子", en: "Family" },
  "family-happy-valley.area": { "zh-Hans": "南山", en: "Nanshan" },
  "family-happy-valley.bestFor": {
    "zh-Hans": "想玩机动游戏的家庭 / 青少年",
    en: "Families and teenagers after thrill rides",
  },
  "family-happy-valley.tips": {
    "zh-Hans": "欢乐谷成人票约 ¥228、儿童及长者票约 ¥130；70 岁以上、1.2 米以下免费。夏天建议下午入场玩到夜场。",
    en: "Happy Valley adult tickets are about ¥228; child and senior tickets about ¥130. Free under 1.2m and over 70. In summer, go in the afternoon and stay for the night session.",
  },
  "family-happy-valley.stop0.name": { "zh-Hans": "深圳欢乐谷", en: "Shenzhen Happy Valley（深圳欢乐谷）" },
  "family-happy-valley.stop0.area": { "zh-Hans": "南山", en: "Nanshan" },
  "family-happy-valley.stop0.desc": {
    "zh-Hans": "机动游戏 + 儿童专区 + 夜场表演",
    en: "Thrill rides, a kids' zone and night-time shows",
  },
  "family-happy-valley.stop1.name": {
    "zh-Hans": "华侨城创意文化园 OCT-LOFT",
    en: "OCT-LOFT Creative Culture Park（华侨城创意文化园）",
  },
  "family-happy-valley.stop1.area": { "zh-Hans": "南山", en: "Nanshan" },
  "family-happy-valley.stop1.desc": {
    "zh-Hans": "旧厂房文创街区，咖啡、书店、小店；免费",
    en: "A converted factory district with coffee, bookshops and small labels — free",
  },
  "family-happy-valley.stop2.name": { "zh-Hans": "欢乐海岸", en: "Happy Coast（欢乐海岸）" },
  "family-happy-valley.stop2.area": { "zh-Hans": "南山", en: "Nanshan" },
  "family-happy-valley.stop2.desc": { "zh-Hans": "晚餐 + 水舞秀", en: "Dinner and the water show" },

  // ── 美食 foods ──────────────────────────────────────────
  "0.name": { "zh-Hans": "东门老街小吃", en: "Dongmen Old Street Snacks（东门老街小吃）" },
  "0.area": { "zh-Hans": "罗湖・东门", en: "Luohu · Dongmen" },
  "0.category": { "zh-Hans": "广式小吃 / 街头小吃", en: "Cantonese snacks / street food" },
  "0.mustTry": { "zh-Hans": "牛杂、肠粉、烤生蚝、糖水", en: "Beef offal, rice rolls, grilled oysters, sweet soup" },

  "1.name": { "zh-Hans": "广式云吞面 / 烧腊", en: "Cantonese Wonton Noodles / Roast Meats（云吞面 / 烧腊）" },
  "1.area": { "zh-Hans": "罗湖・蔡屋围 / 向西村", en: "Luohu · Caiwuwei / Xiangxi" },
  "1.category": { "zh-Hans": "广府菜", en: "Cantonese" },
  "1.mustTry": { "zh-Hans": "鲜虾云吞面、烧鹅、叉烧", en: "Prawn wonton noodles, roast goose, char siu" },

  "2.name": { "zh-Hans": "潮汕砂锅粥", en: "Chaoshan Claypot Congee（潮汕砂锅粥）" },
  "2.area": { "zh-Hans": "罗湖・向西村 / 福田・新村", en: "Luohu · Xiangxi / Futian · Xincun" },
  "2.category": { "zh-Hans": "潮汕菜", en: "Chaoshan" },
  "2.mustTry": { "zh-Hans": "虾蟹砂锅粥、卤水拼盘、蚝仔烙", en: "Prawn and crab congee, braised platter, oyster omelette" },

  "3.name": { "zh-Hans": "潮汕卤鹅 / 打冷", en: "Chaoshan Braised Goose / Cold Dishes（潮汕卤鹅）" },
  "3.area": { "zh-Hans": "福田・皇庭广场 / 罗湖・KK Mall", en: "Futian · Huangting Plaza / Luohu · KK Mall" },
  "3.category": { "zh-Hans": "潮汕菜", en: "Chaoshan" },
  "3.mustTry": {
    "zh-Hans": "狮头鹅卤水拼盘、鹅肠、普宁炸豆腐",
    en: "Braised lion-head goose platter, goose intestine, Puning fried tofu",
  },

  "4.name": { "zh-Hans": "粤式早茶 / 点心", en: "Cantonese Morning Tea / Dim Sum（粤式早茶）" },
  "4.area": { "zh-Hans": "罗湖 / 福田（口岸沿线）", en: "Luohu / Futian (near the border crossings)" },
  "4.category": { "zh-Hans": "粤菜・饮茶", en: "Cantonese · yum cha" },
  "4.mustTry": {
    "zh-Hans": "虾饺、金沙海虾红米肠、酥皮叉烧包",
    en: "Prawn dumplings, golden prawn rice rolls, flaky char siu buns",
  },

  "5.name": { "zh-Hans": "蛇口海上世界海鲜", en: "Shekou Sea World Seafood（蛇口海上世界）" },
  "5.area": { "zh-Hans": "南山・蛇口", en: "Nanshan · Shekou" },
  "5.category": { "zh-Hans": "海鲜", en: "Seafood" },
  "5.mustTry": { "zh-Hans": "清蒸海鱼、椒盐海虾、生蚝", en: "Steamed fish, salt-and-pepper prawns, oysters" },

  "6.name": { "zh-Hans": "客家菜（龙岗 / 甘坑）", en: "Hakka Food (Longgang / Gankeng)（客家菜）" },
  "6.area": { "zh-Hans": "龙岗・甘坑古镇", en: "Longgang · Gankeng Old Town" },
  "6.category": { "zh-Hans": "客家菜", en: "Hakka" },
  "6.mustTry": {
    "zh-Hans": "盐焗鸡、梅菜扣肉、客家酿豆腐、窑鸡",
    en: "Salt-baked chicken, pork with preserved mustard greens, stuffed tofu, kiln chicken",
  },

  "7.name": { "zh-Hans": "龙岗大盆菜", en: "Longgang Poon Choi（龙岗大盆菜）" },
  "7.area": { "zh-Hans": "龙岗 / 深圳东部围村", en: "Longgang / eastern Shenzhen walled villages" },
  "7.category": { "zh-Hans": "客家菜・节庆", en: "Hakka · festive" },
  "7.mustTry": {
    "zh-Hans": "围村盆菜（红焖猪肉、山珍层层叠）",
    en: "Village poon choi — braised pork and delicacies layered in one basin",
  },

  "8.name": { "zh-Hans": "光明乳鸽", en: "Guangming Squab（光明乳鸽）" },
  "8.area": { "zh-Hans": "光明区", en: "Guangming District" },
  "8.category": { "zh-Hans": "深圳本地特产", en: "Shenzhen local specialty" },
  "8.mustTry": { "zh-Hans": "红烧乳鸽", en: "Braised squab" },

  "9.name": { "zh-Hans": "沙井蚝 / 南澳鲍鱼", en: "Shajing Oysters / Nan'ao Abalone（沙井蚝 / 南澳鲍鱼）" },
  "9.area": { "zh-Hans": "宝安・沙井 / 大鹏・南澳", en: "Bao'an · Shajing / Dapeng · Nan'ao" },
  "9.category": { "zh-Hans": "深圳本地特产", en: "Shenzhen local specialty" },
  "9.mustTry": {
    "zh-Hans": "炭烤生蚝、清蒸沙井蚝、盐焗鲍鱼",
    en: "Char-grilled oysters, steamed Shajing oysters, salt-baked abalone",
  },

  "10.name": { "zh-Hans": "椰子鸡火锅", en: "Coconut Chicken Hotpot（椰子鸡火锅）" },
  "10.area": { "zh-Hans": "罗湖 / 福田", en: "Luohu / Futian" },
  "10.category": { "zh-Hans": "深圳流行菜", en: "Shenzhen favourite" },
  "10.mustTry": { "zh-Hans": "椰子鸡煲、竹笙、文昌鸡", en: "Coconut chicken pot, bamboo fungus, Wenchang chicken" },

  "11.name": { "zh-Hans": "深圳夜市烧烤 / 夜宵", en: "Shenzhen Night-Market BBQ / Late-night Eats（夜市烧烤）" },
  "11.area": { "zh-Hans": "罗湖・东门 / 南山・海上世界", en: "Luohu · Dongmen / Nanshan · Sea World" },
  "11.category": { "zh-Hans": "夜宵", en: "Late-night" },
  "11.mustTry": { "zh-Hans": "炭烤生蚝、烤鱿鱼、砂锅粥", en: "Char-grilled oysters, grilled squid, claypot congee" },

  // ── 優惠 deals ──────────────────────────────────────────
  "d-window-world.title": { "zh-Hans": "深圳世界之窗 门票 / 夜场票", en: "Window of the World: Day / Night Tickets" },
  "d-window-world.merchant": { "zh-Hans": "深圳世界之窗", en: "Window of the World" },
  "d-window-world.area": { "zh-Hans": "南山", en: "Nanshan" },
  "d-window-world.summary": {
    "zh-Hans": "全日成人约 ¥220、夜场约 ¥120；1.2 米以下及 70 岁以上免费。线上提前购票通常比现场便宜。",
    en: "Full-day adult tickets about ¥220, night tickets about ¥120; free under 1.2m and over 70. Buying online in advance is usually cheaper than at the gate.",
  },

  "d-happy-valley.title": { "zh-Hans": "深圳欢乐谷 亲子 / 长者票", en: "Happy Valley: Family / Senior Tickets" },
  "d-happy-valley.merchant": { "zh-Hans": "深圳欢乐谷", en: "Shenzhen Happy Valley" },
  "d-happy-valley.area": { "zh-Hans": "南山", en: "Nanshan" },
  "d-happy-valley.summary": {
    "zh-Hans": "成人约 ¥228、儿童及 60–70 岁长者约 ¥130；1.2 米以下及 70 岁以上免费。官方小程序购票免排队。",
    en: "Adults about ¥228, children and seniors 60–70 about ¥130; free under 1.2m and over 70. Buy on the official mini-program to skip the queue.",
  },

  "d-szoo.title": { "zh-Hans": "深圳野生动物园 家庭日", en: "Shenzhen Safari Park: Family Day" },
  "d-szoo.merchant": { "zh-Hans": "深圳野生动物园", en: "Shenzhen Safari Park" },
  "d-szoo.area": { "zh-Hans": "南山", en: "Nanshan" },
  "d-szoo.summary": {
    "zh-Hans": "儿童（1.2–1.5 米）及 65–69 岁 ¥140、青少年 / 学生 ¥190；70 岁以上及 1.2 米以下免费。",
    en: "Children (1.2–1.5m) and ages 65–69 ¥140; teens and students ¥190; free over 70 and under 1.2m.",
  },

  "d-splendid-china.title": { "zh-Hans": "锦绣中华・中国民俗文化村", en: "Splendid China Folk Village" },
  "d-splendid-china.merchant": { "zh-Hans": "锦绣中华", en: "Splendid China" },
  "d-splendid-china.area": { "zh-Hans": "南山", en: "Nanshan" },
  "d-splendid-china.summary": {
    "zh-Hans": "成人约 ¥220（线上常有 ¥210）；儿童 / 长者优待票约 ¥110；1.2 米以下及 70 岁以上免费。",
    en: "Adults about ¥220 (often ¥210 online); child and senior tickets about ¥110; free under 1.2m and over 70.",
  },

  "d-bay-glory-wheel.title": { "zh-Hans": "欢乐港湾「湾区之光」摩天轮", en: "Bay Glory Ferris Wheel at One Bay" },
  "d-bay-glory-wheel.merchant": { "zh-Hans": "欢乐港湾", en: "One Bay (Huanle Gangwan)" },
  "d-bay-glory-wheel.area": { "zh-Hans": "宝安", en: "Bao'an" },
  "d-bay-glory-wheel.summary": {
    "zh-Hans": "128 米海景摩天轮。平日 / 周末约 ¥150、节假日约 ¥180；1 米以下免费；10 人以上团体票约 ¥120/人。",
    en: "A 128m wheel over the bay. About ¥150 on weekdays and weekends, ¥180 on holidays; free under 1m; group tickets about ¥120 each for 10 or more.",
  },

  "d-alipayhk-sz.title": { "zh-Hans": "AlipayHK 深圳消费立减", en: "AlipayHK: Spend & Save in Shenzhen" },
  "d-alipayhk-sz.merchant": { "zh-Hans": "AlipayHK × 深圳商圈", en: "AlipayHK × Shenzhen shopping districts" },
  "d-alipayhk-sz.area": { "zh-Hans": "罗湖 / 福田 / 南山", en: "Luohu / Futian / Nanshan" },
  "d-alipayhk-sz.summary": {
    "zh-Hans": "标有「Alipay+ 扫码领券」的商户扫码领券享立减；人民币交易自动以港币结算、免手续费。",
    en: "Scan to collect a voucher at shops showing the Alipay+ sign; RMB payments settle in HKD with no fee.",
  },

  "d-wechatpayhk-sz.title": { "zh-Hans": "WeChat Pay HK 港币直付 + 商场券", en: "WeChat Pay HK: Pay in HKD + Mall Vouchers" },
  "d-wechatpayhk-sz.merchant": { "zh-Hans": "WeChat Pay HK × 深圳商场", en: "WeChat Pay HK × Shenzhen malls" },
  "d-wechatpayhk-sz.area": { "zh-Hans": "福田 / 罗湖 / 南山", en: "Futian / Luohu / Nanshan" },
  "d-wechatpayhk-sz.summary": {
    "zh-Hans": "以港币钱包付款 0 手续费、自动汇率结算；合作商场常设满减券和交通券，深圳出租车也能用。",
    en: "Pay from an HKD wallet with no fee and automatic exchange; partner malls run regular spend-and-save and transport vouchers, and Shenzhen taxis take it too.",
  },

  "d-unionpay-gba.title": { "zh-Hans": "银联 / 云闪付「玩赚大湾区」", en: "UnionPay / Cloud QuickPass: Greater Bay Area Offers" },
  "d-unionpay-gba.merchant": { "zh-Hans": "中国银联", en: "China UnionPay" },
  "d-unionpay-gba.area": { "zh-Hans": "深圳全市", en: "All of Shenzhen" },
  "d-unionpay-gba.summary": {
    "zh-Hans": "深圳地铁公交手机闪付半价（每笔最高减 ¥2）；港澳居民凭回乡证可登记「国补」享 15% 立减。",
    en: "Half-price metro and bus fares with tap-to-pay on your phone (up to ¥2 off each trip); HK and Macau residents can register for a 15% subsidy with a Home Return Permit.",
  },

  "d-tax-refund.title": { "zh-Hans": "深圳离境退税（港人适用）", en: "Shenzhen Departure Tax Refund (for HK visitors)" },
  "d-tax-refund.merchant": { "zh-Hans": "深圳市财政局 / 税务局", en: "Shenzhen Finance Bureau / Tax Service" },
  "d-tax-refund.area": { "zh-Hans": "罗湖 / 福田 / 深圳湾 / 机场", en: "Luohu / Futian / Shenzhen Bay / Airport" },
  "d-tax-refund.summary": {
    "zh-Hans": "同店同日满 ¥200 可退；13% 税率商品退 11%、9% 税率退 8%；离境日距购买日须 90 天内。",
    en: "Refunds from ¥200 at the same shop on the same day; 11% back on 13%-rate goods and 8% on 9%-rate goods; you must leave within 90 days of purchase.",
  },

  "d-tourist-bus.title": {
    "zh-Hans": "深圳观光巴士（「红胖子」双层巴士）",
    en: "Shenzhen Sightseeing Bus (the red double-decker)",
  },
  "d-tourist-bus.merchant": { "zh-Hans": "深圳巴士集团", en: "Shenzhen Bus Group" },
  "d-tourist-bus.area": { "zh-Hans": "全市", en: "Citywide" },
  "d-tourist-bus.summary": {
    "zh-Hans": "4 条主题线可随上随下、任意换乘。24 小时票约 ¥50、48 小时套票约 ¥80、1.4 米以下免费。",
    en: "Four themed routes with hop-on, hop-off transfers. About ¥50 for 24 hours, ¥80 for 48 hours; free under 1.4m.",
  },

  // ── 優惠的來源與有效期（票 11：契約要求優惠清單卡含「來源」欄）──
  "d-window-world.validUntil": { "zh-Hans": "常设（以官方为准）", en: "Permanent (check official prices)" },
  "d-window-world.sourceName": {
    "zh-Hans": "景区公开票价（深圳本地宝汇总）",
    en: "Published attraction prices (via Shenzhen Bendibao)",
  },
  "d-happy-valley.validUntil": { "zh-Hans": "常设（以官方为准）", en: "Permanent (check official prices)" },
  "d-happy-valley.sourceName": { "zh-Hans": "欢乐谷官网", en: "Happy Valley official site" },
  "d-szoo.validUntil": { "zh-Hans": "常设", en: "Permanent" },
  "d-szoo.sourceName": { "zh-Hans": "深圳野生动物园官网", en: "Shenzhen Safari Park official site" },
  "d-splendid-china.validUntil": { "zh-Hans": "常设（以官方为准）", en: "Permanent (check official prices)" },
  "d-splendid-china.sourceName": {
    "zh-Hans": "景区公开票价（深圳本地宝汇总）",
    en: "Published attraction prices (via Shenzhen Bendibao)",
  },
  "d-bay-glory-wheel.validUntil": { "zh-Hans": "常设（以官方为准）", en: "Permanent (check official prices)" },
  "d-bay-glory-wheel.sourceName": { "zh-Hans": "欢乐港湾公开票价 / KKday", en: "One Bay published prices / KKday" },
  "d-alipayhk-sz.validUntil": { "zh-Hans": "活动期短，以 App 为准", en: "Short campaign — check the app" },
  "d-alipayhk-sz.sourceName": {
    "zh-Hans": "AlipayHK / 罗湖跨境消费嘉年华公开报道",
    en: "AlipayHK / Luohu cross-border shopping festival coverage",
  },
  "d-wechatpayhk-sz.validUntil": { "zh-Hans": "活动期短，以 App 为准", en: "Short campaign — check the app" },
  "d-wechatpayhk-sz.sourceName": {
    "zh-Hans": "WeChat Pay HK 官方公开说明",
    en: "WeChat Pay HK official announcement",
  },
  "d-unionpay-gba.validUntil": { "zh-Hans": "以云闪付 App 为准", en: "Check the Cloud QuickPass app" },
  "d-unionpay-gba.sourceName": {
    "zh-Hans": "中国银联 / 云闪付公开活动",
    en: "China UnionPay / Cloud QuickPass campaign",
  },
  "d-tax-refund.validUntil": { "zh-Hans": "长期政策（门槛以官方为准）", en: "Long-standing policy (thresholds per official notice)" },
  "d-tax-refund.sourceName": {
    "zh-Hans": "香港工业贸易署通函（转载深圳市财政局公告）",
    en: "HK Trade and Industry Department circular (reprinting the Shenzhen Finance Bureau notice)",
  },
  "d-tourist-bus.validUntil": { "zh-Hans": "常设", en: "Permanent" },
  "d-tourist-bus.sourceName": { "zh-Hans": "深圳巴士集团公开票价", en: "Shenzhen Bus Group published fares" },
};
