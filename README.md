# zmanim-node <a style='float:right'>זמנים-נוד</a>

<div dir='rtl'>

**אפליקציית נוד לבדיקת זמני ההלכה + אפשרות הרשמה לקבלת התראות פוש רבע שעה לפני שקיעה לפי ערים בישראל**

האפליקציה (רצה על הרוקו Heroku): **https://chvsunset.herokuapp.com**

## API זמנים
האפליקציה כוללת API לקבלת זמני היום לכל עיר בישראל.

יש לגשת ל-URL הזה - https://chvsunset.herokuapp.com/api
<br>
עם פרמטר של העיר הרצויה - https://chvsunset.herokuapp.com/api/?city=ירושלים

בתשובה יתקבל JSON עם הנתונים (מה שמקבלים באתר כשעושים בדיקת זמנים - הנץ, קריאת שמע-גר"א, חצות ושקיעה) במבנה הזה:
</div>

```
{
    "cityname": "ירושלים",
    "netz": "05:34:51",
    "gra": "09:08:14",
    "chatzos": "12:41:36",
    "shkia": "19:48:22"
}
```

<div dir='rtl'>

דוגמא לשימוש ב-API בג'אווהסקריפט:
</div>

```
async function getzman(city) {
  const response = await fetch('https://chvsunset.herokuapp.com/api/?city=' + city)
  const data = await response.json()
  return data
}
```

<div dir='rtl'>

כעת נקרא לפונקציה ככה:
</div>

```
getzman('ירושלים')
```

<div dir='rtl'>

לדוגמא אם רוצים לקבל את השקיעה -
</div>

```
let times = await getzman('ירושלים')
console.log(times.shkia)
```

<div dir='rtl'>

### 📦 חבילות עיקריות בשימוש:
* [kosher-zmanim](https://www.npmjs.com/package/kosher-zmanim)
* [node-geocoder](https://www.npmjs.com/package/node-geocoder)
* [moment](https://www.npmjs.com/package/moment)
* [web-push](https://www.npmjs.com/package/web-push)


> אפשר לראות את שלבי ה'פרוייקט' [כאן](https://tchumim.com/post/117654) ו[כאן](https://tchumim.com/post/116237)<br>
> (לכניסה לשני הקישורים יש להירשם לפורום תחומים + כניסה לקבוצת 'תיכנות')

### **אשמח להערות והארות!!**

## התקנה לוקלית
כדי להפעיל אצלכם במחשב, הורידו את הריפו 
</div>

```
git clone https://github.com/chaim-chv/zmanim-node.git && cd zmanim-node
```

<div dir='rtl'>

והכניסו את המפתחות המתאימים בקובץ env (צריך להכניס את מפתחות ה-VAPID - מפיקים אותם בצורה פשוטה כמו שמוסבר [כאן](https://www.npmjs.com/package/web-push#command-line). חוץ מזה צריך להכניס גם כתובת URI של מסד נתונים MongoDB)

ואז התקנה של החבילות הנצרכות ב-npm:
</div>

```
npm install
```

<div dir='rtl'>

ואז
</div>

```
npm start
```

<div dir='rtl'>
יפעיל שרת לוקאלי בפורט 5000 אצלכם (או שתגדירו אחרת).

## הפעלה בהרוקו
**להתקנה מהירה בהרוקו** - לחצו על הכפתור והגדירו את המפתחות המתאימים במקומות הנכונים (יש תיאור לכל מפתח):
</div>

<div align='center'>

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/chaim-chv/zmanim-node/tree/master)

</div>

<div dir='rtl'>
אני לא ממליץ להתקין בהרוקו ישירות מהכפתור התקנה הזה (כיוון שזה יגרום לכך שלא תוכלו להוריד אחרי זה את הגיט של האפליקציה אליכם למחשב כדי לערוך)
<br>
ממליץ לעבוד עם גיט מעיקרא, כך תוכלו לשנות ככל העולה על רוחכם (האפליקציה ששמתי בהרוקו שואבת את ה-branch שלה מכאן).
<br>
ככה תעשו את זה:
</div>

```
git clone https://github.com/chaim-chv/zmanim-node.git && cd zmanim-node
```

<div dir='rtl'>

תערכו אצלכם מה שאתם רוצים בקוד, ושימו לב שכל עריכה אתם מוסיפים לגיט.

כעת צרו אפליקציה חדשה עם [Heroku-CLI](https://devcenter.heroku.com/articles/heroku-cli):
</div>

```
heroku create <app-name>
```

<div dir='rtl'>

ותדחפו אליה את התוכן:
</div>

```
git push heroku master
```
