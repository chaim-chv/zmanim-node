if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
}

const publicVapidKey = "BETFoC2Sxqx1JSpBeeXwL70kMp4Iy-nwl0pDiqGUHQzM4DWdu2HbFnkJewUoBNRLS9H2vuvBfg_LNYR4tVl5uKc";

// Copied from the web-push documentation
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

window.subscribe = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log(`no sw`);
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  // Subscribe to push notifications
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicVapidKey) });
  const name = document.getElementById("nameee").value;
  const city = document.getElementById("cityyy").value;
  document.getElementById("regrep").innerHTML = "";
  const response = await fetch("/subscribe", { method: "POST", body: JSON.stringify({ subscription: subscription, name: name, city: city }), headers: { "content-type": "application/json;charset=utf-8" } });
  if (response.status == 401) {
    document.getElementById("regrep").innerHTML = "חובה לציין שם + עיר תקינה";
  }
  if (response.status == 201) {
    document.getElementById("regrep").innerHTML = `נרשמת בהצלחה`;
    document.getElementById("user").innerHTML = `שלום ${name}, אתה מקבל התראות על שקיעה ב${city}. <a class="togglepush" onclick="stoppush()">להפסקת התראות</a>`;
  }
};

fetch("/user", { headers: { "content-type": "application/json" }, credentials: "include", method: "POST" }).then((response) => {
  if (response.status == 404 || response.status == 401) {
    document.getElementById("user").innerHTML = "משתמש: לא רשום לקבלת התראות מדפדפן זה";
  } else {
    response.json().then((data) => {
      if (data.stop == false) {
        console.log(data);
        document.getElementById("user").innerHTML = `שלום ${data.name}, אתה מקבל התראות על שקיעה ב${data.city}. <a class="togglepush" onclick="stoppush()">להפסקת התראות</a>`;
      } else {
        console.log(data);
        document.getElementById("user").innerHTML = `שלום ${data.name}, נרשמת לקבל התראות על שקיעה ב${data.city}, והפסקת את ההתראות. <a class="togglepush" onclick="startpush()">להחזרת התראות</a>`;
      }
    });
  }
});

document.querySelector('#citt').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    getsun();
  }
});

document.querySelector('#nameee').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    subscribe();
  }
});
document.querySelector('#cityyy').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    subscribe();
  }
});

function getsun() {
  document.getElementById("err").innerHTML = ``;
  document.getElementById("cityname").innerHTML = ``;
  document.getElementById("netz").innerHTML = ``;
  document.getElementById("gra").innerHTML = ``;
  document.getElementById("chatzos").innerHTML = ``;
  document.getElementById("shkia").innerHTML = ``;
  var city = document.getElementById("citt").value;
  fetch("/", { method: "POST", body: JSON.stringify({ city: city }), headers: { "content-type": "application/json" } }).then((response) => {
    if (response.status == 404 || response.status == 401) {
      document.getElementById("err").innerHTML = `לא הצלחנו למצוא כזו עיר`;
    } else {
      response.json().then((data) => {
        console.log(data);
        document.getElementById("cityname").innerHTML = `<strong>זמנים ל${data.city}:</strong>`;
        document.getElementById("netz").innerHTML = `נץ בשעה ${data.zmanim.netz}\n`;
        document.getElementById("gra").innerHTML = `זמן קריאת שמע (הגר"א) בשעה ${data.zmanim.gra}\n`;
        document.getElementById("chatzos").innerHTML = `חצות בשעה ${data.zmanim.chatzos}\n`;
        document.getElementById("shkia").innerHTML = `שקיעה בשעה ${data.zmanim.shkia}`;
      });
    }
  });
}

async function stoppush() {
  const response = await fetch("/stop", { headers: { "content-type": "application/json" }, credentials: "include", method: "POST" });
  if (response.status == 202) {
    document.getElementById("user").innerHTML = `התראות הופסקו. <a class="togglepush" onclick="startpush()">ביטול</a>`;
  } else {
    // cant stop push
  }
}

async function startpush() {
  const response = await fetch("/start", { headers: { "content-type": "application/json" }, credentials: "include", method: "POST" });
  if (response.status == 202) {
    document.getElementById("user").innerHTML = `התראות הופעלו. <a class="togglepush" onclick="stoppush()">ביטול</a>`;
  } else {
    // cant start push
  }
}