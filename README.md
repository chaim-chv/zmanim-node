# zmanim-node


<div dir="rtl" style="text-align:right">

# זמנים-נוד
**אפליקציית נוד לבדיקת זמני ההלכה + אפשרות הרשמה לקבלת התראות פוש רבע שעה לפני שקיעה לפי ערים בישראל**

האפליקציה (רצה על הרוקו Heroku): **https://chvsunset.herokuapp.com/**

📦 חבילות עיקריות בשימוש:
* [kosher-zmanim](https://www.npmjs.com/package/kosher-zmanim)
* [node-geocoder](https://www.npmjs.com/package/node-geocoder)
* [moment](https://www.npmjs.com/package/moment)
* [web-push](https://www.npmjs.com/package/web-push)

כתבתי [כאן](https://tchumim.com/post/117654) קצת על המערכת והסבר על ה-API שלה לקבלת זמנים דרך בקשת HTTPS.
<br>
[כאן](https://tchumim.com/post/116237) אפשר לקרוא עוד קצת על ה'פרוייקט'...
<br>
(לכניסה לשני הקישורים יש להירשם לפורום תחומים + כניסה לקבוצת 'תיכנות')

**אשמח להערות והארות!!**

## התקנה לוקלית
כדי להפעיל אצלכם במחשב, הורידו את הריפו 
</div>

```
git clone https://github.com/chaim-chv/zmanim-node.git && cd zmanim-node
```
<div dir="rtl" style="text-align:right">

והכניסו את המפתחות המתאימים בקובץ env (צריך להכניס את מפתחות ה-VAPID - מפיקים אותם בצורה פשוטה כמו שמוסבר [כאן](https://www.npmjs.com/package/web-push#command-line). חוץ מזה צריך להכניס גם כתובת URI של מסד נתונים MongoDB) ואז התקנה של החבילות הנצרכות ב-npm:
</div>

```
npm install
```
<div dir="rtl" style="text-align:right">

ואז
</div>

```
npm start
```

<div dir="rtl" style="text-align:right">

יפעיל שרת לוקאלי בפורט 5000 אצלכם (או שתגדירו אחרת).

## הפעלה בהרוקו
**להתקנה מהירה בהרוקו** - לחצו על הכפתור והגדירו את המפתחות המתאימים במקומות הנכונים (יש תיאור לכל מפתח):<br>
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/chaim-chv/zmanim-node/tree/master)

אני לא ממליץ להתקין בהרוקו ישירות מהכפתור התקנה הזה (כיוון שזה יגרום לכך שלא תוכלו להוריד אחרי זה את הגיט של האפליקציה אליכם למחשב כדי לערוך)<br>
ממליץ לעבוד עם גיט מעיקרא, כך תוכלו לשנות ככל העולה על רוחכם (האפליקציה ששמתי בהרוקו שואבת את ה-branch שלה מכאן)
ככה תעשו את זה:
</div>

```
git clone https://github.com/chaim-chv/zmanim-node.git && cd zmanim-node
```
<div dir="rtl" style="text-align:right">

תערכו אצלכם מה שאתם רוצים בקוד, ושימו לב שכל עריכה אתם מוסיפים לגיט.

כעת צרו אפליקציה חדשה עם [Heroku-CLI](https://devcenter.heroku.com/articles/heroku-cli):
</div>

```
heroku create <app-name>
```
<div dir="rtl" style="text-align:right">

ותדחפו אליה את התוכן:
</div>

```
git push heroku master
```