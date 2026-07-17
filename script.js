const bitcoinPriceElement =
  document.getElementById("bitcoinPrice");

const hillShape =
  document.querySelector(".hill-shape");

const rider =
  document.getElementById("rider");

const trailStatusTitle =
  document.querySelector(
    ".trail-status-title"
  );

const trailStatusDetail =
  document.getElementById(
    "trailStatusDetail"
  );

const dailyMountainShape =
  document.querySelector(
    ".daily-mountain-shape"
  );

const dailyMountains =
  document.getElementById(
    "dailyMountains"
  );

const dailyPeakLabel =
  document.getElementById(
    "dailyPeakLabel"
  );

const dailyPeakPrice =
  document.getElementById(
    "dailyPeakPrice"
  );

const dailyPeakDate =
  document.getElementById(
    "dailyPeakDate"
  );


const game =
  document.querySelector(
    ".game"
  );


const blockEventLayer =
  document.getElementById(
    "blockEventLayer"
  );

const blockImpactSite =
  document.getElementById(
    "blockImpactSite"
  );

const blockMinedNumber =
  document.getElementById(
    "blockMinedNumber"
  );

const currentBlockPanel =
  document.getElementById(
    "currentBlockPanel"
  );

const currentBlockNumber =
  document.getElementById(
    "currentBlockNumber"
  );

const currentBlockAge =
  document.getElementById(
    "currentBlockAge"
  );




/* -------------------------------- */
/* Coinbase connections             */
/* -------------------------------- */

const WEBSOCKET_URL =
  "wss://ws-feed.exchange.coinbase.com";


const REST_PRICE_URL =
  "https://api.coinbase.com/v2/prices/BTC-USD/spot";


/*
  Public Coinbase Exchange candle data.

  This supplies today's BTC-USD price history
  for the distant mountain range.
*/
const DAILY_CANDLES_URL =
  "https://api.exchange.coinbase.com/products/BTC-USD/candles";


/*
  Lightweight Bitcoin network check.

  The chain-tip endpoint returns only the current
  block height, so this adds very little network or
  processing work compared with the terrain animation.
*/
const BLOCK_API_BASE_URL =
  "https://blockstream.info/api";

const BLOCK_HEIGHT_URL =
  `${BLOCK_API_BASE_URL}/blocks/tip/height`;

const BLOCK_HEIGHT_CHECK_INTERVAL =
  30 * 1000;

const BLOCK_AGE_UPDATE_INTERVAL =
  15 * 1000;

/*
  Keep the landed Bitcoin block visible long
  enough for visitors to notice the mined-block scene.
*/
const BLOCK_EVENT_CLEANUP_DELAY =
  32 * 1000;

const BLOCK_EVENT_LANDING_X = 820;

/*
  Move the landed Bitcoin block with the Western world rather
  than keeping it fixed beside the centred rider. This
  roughly matches the existing 24-second scenery crossing.
*/
const BLOCK_EVENT_WORLD_SPEED =
  1000 / 24;


/* -------------------------------- */
/* Terrain timing                   */
/* -------------------------------- */

const TERRAIN_PRICE_INTERVAL = 1000;


/*
  Keep your currently selected terrain
  frame rate here.

  If you already changed this to 18,
  leave it at 18.
*/
const TERRAIN_FRAME_RATE = 18;


const TERRAIN_FRAME_INTERVAL =
  1000 / TERRAIN_FRAME_RATE;


/* -------------------------------- */
/* Daily mountain settings          */
/* -------------------------------- */

/*
  Use one 15-minute Bitcoin candle.

  Coinbase expresses this interval in
  seconds.
*/
const DAILY_CANDLE_GRANULARITY =
  900;


/*
  Refresh the mountain chart only once
  every 15 minutes.

  This keeps network and processing use low.
*/
const DAILY_MOUNTAIN_REFRESH_INTERVAL =
  15 * 60 * 1000;


/*
  Mountain drawing boundaries.

  Smaller SVG y values appear higher
  on the screen.
*/
const DAILY_MOUNTAIN_TOP_Y = 80;

const DAILY_MOUNTAIN_BOTTOM_Y = 315;


/* -------------------------------- */
/* WebSocket reliability settings   */
/* -------------------------------- */

const INITIAL_RECONNECT_DELAY = 2000;

const MAXIMUM_RECONNECT_DELAY = 30000;


const STALE_PRICE_TIMEOUT = 15000;


const CONNECTION_CHECK_INTERVAL = 5000;


/* -------------------------------- */
/* Terrain layout                   */
/* -------------------------------- */

const CONTROL_POINT_COUNT = 48;

const POINT_SPACING =
  1000 / (CONTROL_POINT_COUNT - 3);


/*
  Move the live trail unmistakably faster across the screen
  for a stronger rollercoaster feeling without increasing
  Coinbase network requests or changing price timing.
*/
const RIDE_SPEED_MULTIPLIER = 2.4;


const SCROLL_SPEED =
  (
    POINT_SPACING /
    (TERRAIN_PRICE_INTERVAL / 1000)
  ) *
  RIDE_SPEED_MULTIPLIER;


const MINIMUM_TERRAIN_Y = 75;

const MAXIMUM_TERRAIN_Y = 300;

const TERRAIN_CENTRE_Y = 190;


/*
  The foreground trail is a true rolling chart of
  recent Coinbase WebSocket prices.

  A minimum visible price range prevents a tiny,
  quiet-market change from filling the whole screen.
*/
const LIVE_CHART_TOP_Y = 92;

const LIVE_CHART_BOTTOM_Y = 292;

const LIVE_CHART_MINIMUM_PRICE_RANGE = 50;


/*
  More dramatic Bitcoin-generated terrain.

  If you did not change this earlier and
  want the original strength, use 55.
*/
const MAXIMUM_PRICE_STEP = 70;


/*
  Recent-trend terrain settings.

  The rider follows Bitcoin's overall direction
  instead of reacting to every individual trade.
*/
const TREND_WINDOW_DURATION = 60 * 1000;

const TREND_MINIMUM_DURATION = 8 * 1000;

const TREND_SAMPLE_INTERVAL = 1000;

const QUIET_TREND_THRESHOLD = 8;

const FULL_TREND_MOVE = 90;

const MAXIMUM_TERRAIN_SLOPE = 7;

const SLOPE_RESPONSE = 0.18;

const QUIET_SLOPE_RESPONSE = 0.08;

const TERRAIN_EDGE_SOFTENING = 55;


/*
  Preserve the small live-price bumps on top of the
  longer momentum-driven climbs and descents.

  A roughly $18 one-sample move reaches full bump
  strength, while the square-root response keeps very
  small real movements visible without creating cliffs.
*/
const SMALL_PRICE_FULL_MOVE = 18;

const MAXIMUM_SMALL_PRICE_BUMP = 20;


/* -------------------------------- */
/* Price state                      */
/* -------------------------------- */

let latestBitcoinPrice = null;

let lastTerrainPrice = null;

let previousDisplayedPrice = null;

let lastTickerMessageTime = 0;

let restRequestInProgress = false;


/*
  Rolling WebSocket price history used to decide
  whether the incoming trail should climb, descend,
  or gradually level out.
*/
let recentPriceHistory = [];

let lastTrendSampleTime = 0;

let currentTerrainSlope = 0;


/* -------------------------------- */
/* Daily mountain state             */
/* -------------------------------- */

let mountainRequestInProgress = false;

let currentDailyPeak = null;


/* -------------------------------- */
/* Bitcoin block event state        */
/* -------------------------------- */

let latestKnownBlockHeight = null;

let latestKnownBlockTimestamp = null;

let blockHeightRequestInProgress = false;

let blockEventCleanupTimer = null;

let blockEventWorldX = null;

let blockEventLandingBottom = null;

let lastSmoothTerrainPoints = [];


/* -------------------------------- */
/* WebSocket state                  */
/* -------------------------------- */

let bitcoinSocket = null;

let reconnectTimer = null;

let reconnectDelay =
  INITIAL_RECONNECT_DELAY;


/* -------------------------------- */
/* Terrain animation state          */
/* -------------------------------- */

let terrainAnimationFrame = null;

let lastAnimationTime = null;

let lastRenderTime = 0;

let scrollOffset = 0;


/*
  Starting landscape.

  Live prices gradually replace these values
  as new terrain enters from the right.
*/
let terrainYValues =
  Array(
    CONTROL_POINT_COUNT
  ).fill(
    TERRAIN_CENTRE_Y
  );


/*
  Actual sampled BTC prices corresponding to the
  foreground terrain points.
*/
let terrainPriceValues = [];


/* -------------------------------- */
/* General helpers                  */
/* -------------------------------- */

function clamp(value, minimum, maximum) {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}


function parseBitcoinPrice(value) {
  const price =
    Number(value);

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return null;
  }

  return price;
}


/* -------------------------------- */
/* Price display                    */
/* -------------------------------- */

function displayBitcoinPrice(price) {
  if (!bitcoinPriceElement) {
    return;
  }

  bitcoinPriceElement.textContent =
    price.toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
}


function updatePriceColour(
  currentPrice
) {
  if (!bitcoinPriceElement) {
    return;
  }

  if (
    previousDisplayedPrice === null
  ) {
    bitcoinPriceElement.style.color =
      "white";

    return;
  }

  if (
    currentPrice >
    previousDisplayedPrice
  ) {
    bitcoinPriceElement.style.color =
      "#72e58c";

  } else if (
    currentPrice <
    previousDisplayedPrice
  ) {
    bitcoinPriceElement.style.color =
      "#ff7b6e";

  } else {
    bitcoinPriceElement.style.color =
      "white";
  }
}


function recordTrendPrice(
  price
) {
  const currentTime =
    Date.now();


  if (
    lastTrendSampleTime !== 0 &&
    currentTime -
      lastTrendSampleTime <
      TREND_SAMPLE_INTERVAL
  ) {
    return;
  }


  lastTrendSampleTime =
    currentTime;


  recentPriceHistory.push({
    time: currentTime,
    price
  });


  const oldestAllowedTime =
    currentTime -
    TREND_WINDOW_DURATION;


  while (
    recentPriceHistory.length > 2 &&
    recentPriceHistory[0].time <
      oldestAllowedTime
  ) {
    recentPriceHistory.shift();
  }
}


function getRecentBitcoinTrend() {
  if (
    recentPriceHistory.length < 2
  ) {
    return 0;
  }


  const newestSample =
    recentPriceHistory[
      recentPriceHistory.length - 1
    ];


  let comparisonSample =
    recentPriceHistory[0];


  for (
    let index = 0;
    index < recentPriceHistory.length;
    index++
  ) {
    const sample =
      recentPriceHistory[index];


    if (
      newestSample.time -
        sample.time >=
        TREND_MINIMUM_DURATION
    ) {
      comparisonSample =
        sample;

      break;
    }
  }


  if (
    newestSample.time -
      comparisonSample.time <
      TREND_MINIMUM_DURATION
  ) {
    return 0;
  }


  return (
    newestSample.price -
    comparisonSample.price
  );
}


function acceptLivePrice(price) {
  const validPrice =
    parseBitcoinPrice(price);

  if (validPrice === null) {
    return;
  }

  updatePriceColour(
    validPrice
  );

  displayBitcoinPrice(
    validPrice
  );

  latestBitcoinPrice =
    validPrice;


  recordTrendPrice(
    validPrice
  );


  previousDisplayedPrice =
    validPrice;

  if (
    lastTerrainPrice === null
  ) {
    lastTerrainPrice =
      validPrice;
  }
}


/* -------------------------------- */
/* Trail status                     */
/* -------------------------------- */

function updateTrailStatus(
  priceChange
) {
  if (
    !trailStatusTitle ||
    !trailStatusDetail
  ) {
    return;
  }


  const absoluteChange =
    Math.abs(priceChange);


  const formattedChange =
    absoluteChange.toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );


  if (priceChange >= 10) {
    trailStatusTitle.textContent =
      "BULLS RIDING";

    trailStatusDetail.textContent =
      `BTC climbed ${formattedChange}`;

    trailStatusTitle.style.color =
      "#72e58c";

    trailStatusDetail.style.color =
      "#72e58c";

    return;
  }


  if (priceChange <= -10) {
    trailStatusTitle.textContent =
      "BEARS IN THE CANYON";

    trailStatusDetail.textContent =
      `BTC fell ${formattedChange}`;

    trailStatusTitle.style.color =
      "#ff7b6e";

    trailStatusDetail.style.color =
      "#ff7b6e";

    return;
  }


  trailStatusTitle.textContent =
    "QUIET ON THE TRAIL";

  trailStatusDetail.textContent =
    `BTC moved ${formattedChange}`;

  trailStatusTitle.style.color =
    "#f2c57c";

  trailStatusDetail.style.color =
    "white";
}


/* -------------------------------- */
/* Daily Bitcoin mountains          */
/* -------------------------------- */

function getStartOfToday() {
  const startOfToday =
    new Date();

  startOfToday.setHours(
    0,
    0,
    0,
    0
  );

  return startOfToday;
}


/*
  Convert today's candle closing prices into
  one distant mountain ridge.

  Higher Bitcoin prices create higher peaks.
  Lower Bitcoin prices create lower valleys.
*/
function createDailyMountainPath(
  prices
) {
  if (
    prices.length < 2
  ) {
    return null;
  }


  const lowestPrice =
    Math.min(...prices);

  const highestPrice =
    Math.max(...prices);


  const priceRange =
    highestPrice -
    lowestPrice;


  const points =
    prices.map(
      (price, index) => {

        const x =
          (
            index /
            (prices.length - 1)
          ) * 1000;


        /*
          If Bitcoin has barely moved, place
          the ridge near the vertical centre.
        */
        const normalizedPrice =
          priceRange === 0
            ? 0.5
            : (
                price -
                lowestPrice
              ) /
              priceRange;


        const y =
          DAILY_MOUNTAIN_BOTTOM_Y -
          (
            normalizedPrice *
            (
              DAILY_MOUNTAIN_BOTTOM_Y -
              DAILY_MOUNTAIN_TOP_Y
            )
          );


        return {
          x,
          y
        };
      }
    );


  let path =
    `M ${points[0].x.toFixed(2)}` +
    ` ${points[0].y.toFixed(2)}`;


  for (
    let index = 1;
    index < points.length;
    index++
  ) {
    path +=
      ` L ${points[index].x.toFixed(2)}` +
      ` ${points[index].y.toFixed(2)}`;
  }


  path +=
    " L 1000 400" +
    " L 0 400" +
    " Z";


  return path;
}

function formatDailyPeakDate(
  timestamp
) {
  const peakDate =
    new Date(
      timestamp * 1000
    );


  if (
    Number.isNaN(
      peakDate.getTime()
    )
  ) {
    return "";
  }


  const dateText =
    peakDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric"
      }
    );


  const timeText =
    peakDate.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );


  return `${dateText} • ${timeText}`;
}

function hideDailyPeakLabel() {
  if (!dailyPeakLabel) {
    return;
  }

  dailyPeakLabel.classList.remove(
    "is-visible"
  );
}


function positionDailyPeakLabel() {
  if (
    !currentDailyPeak ||
    !dailyMountains ||
    !dailyPeakLabel ||
    !dailyPeakPrice ||
    !dailyPeakDate ||
    !game
  ) {
    hideDailyPeakLabel();

    return;
  }


  const mountainBounds =
    dailyMountains.getBoundingClientRect();


  const gameBounds =
    game.getBoundingClientRect();


  if (
    mountainBounds.width <= 0 ||
    mountainBounds.height <= 0 ||
    gameBounds.width <= 0 ||
    gameBounds.height <= 0
  ) {
    hideDailyPeakLabel();

    return;
  }


  const peakScreenX =
    mountainBounds.left -
    gameBounds.left +
    (
      currentDailyPeak.x /
      1000
    ) *
    mountainBounds.width;


  const peakScreenY =
    mountainBounds.top -
    gameBounds.top +
    (
      currentDailyPeak.y /
      400
    ) *
    mountainBounds.height;


  dailyPeakPrice.textContent =
    currentDailyPeak.price.toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }
    );

  dailyPeakDate.textContent =
    formatDailyPeakDate(
      currentDailyPeak.timestamp
    );

  dailyPeakLabel.style.left =
    `${peakScreenX}px`;


  dailyPeakLabel.style.top =
    `${peakScreenY - 7}px`;


  dailyPeakLabel.classList.add(
    "is-visible"
  );
}


function updateDailyPeakLabel(
  candles
) {
  if (
    candles.length < 2
  ) {
    currentDailyPeak = null;

    hideDailyPeakLabel();

    return;
  }


  const prices =
    candles.map(
      candle => {
        return Number(
          candle[4]
        );
      }
    );


  const lowestPrice =
    Math.min(...prices);


  const highestPrice =
    Math.max(...prices);


  const priceRange =
    highestPrice -
    lowestPrice;


  const highestPriceIndex =
    prices.indexOf(
      highestPrice
    );


  const highestCandle =
    candles[
      highestPriceIndex
    ];


  const x =
    (
      highestPriceIndex /
      (prices.length - 1)
    ) *
    1000;


  const normalizedPrice =
    priceRange === 0
      ? 0.5
      : (
          highestPrice -
          lowestPrice
        ) /
        priceRange;


  const y =
    DAILY_MOUNTAIN_BOTTOM_Y -
    (
      normalizedPrice *
      (
        DAILY_MOUNTAIN_BOTTOM_Y -
        DAILY_MOUNTAIN_TOP_Y
      )
    );


  currentDailyPeak = {
    price: highestPrice,

    timestamp:
      Number(
        highestCandle[0]
      ),

    x,
    y
  };


  requestAnimationFrame(
    positionDailyPeakLabel
  );
}


/*
  Request today's 15-minute BTC candles.

  This runs once at startup and then only
  once every 15 minutes.
*/
async function updateDailyMountains() {
  if (
    !dailyMountainShape ||
    mountainRequestInProgress ||
    document.hidden
  ) {
    return;
  }


  mountainRequestInProgress =
    true;


  try {
    const startTime =
      getStartOfToday();


    const endTime =
      new Date();


    const requestUrl =
      DAILY_CANDLES_URL +
      `?start=${encodeURIComponent(
        startTime.toISOString()
      )}` +
      `&end=${encodeURIComponent(
        endTime.toISOString()
      )}` +
      `&granularity=${
        DAILY_CANDLE_GRANULARITY
      }`;


    const response =
      await fetch(
        requestUrl,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        `Daily candle request failed: ${
          response.status
        }`
      );
    }


    const candleData =
      await response.json();


    if (
      !Array.isArray(candleData)
    ) {
      throw new Error(
        "Coinbase returned invalid candle data."
      );
    }


    /*
      Coinbase returns newest candles first.

      Sort them oldest to newest so the daily
      chart travels from left to right.
    */
    const sortedCandles =
      candleData
        .filter(
          candle => {
            return (
              Array.isArray(candle) &&
              candle.length >= 5 &&
              Number.isFinite(
                Number(candle[0])
              ) &&
              parseBitcoinPrice(
                candle[4]
              ) !== null
            );
          }
        )
        .sort(
          (
            firstCandle,
            secondCandle
          ) => {
            return (
              Number(
                firstCandle[0]
              ) -
              Number(
                secondCandle[0]
              )
            );
          }
        );


    const closingPrices =
      sortedCandles.map(
        candle => {
          return Number(
            candle[4]
          );
        }
      );


    const mountainPath =
      createDailyMountainPath(
        closingPrices
      );


    if (mountainPath) {
      dailyMountainShape.setAttribute(
        "d",
        mountainPath
      );


      updateDailyPeakLabel(
        sortedCandles
      );
    }


  } catch (error) {
    /*
      Keep the existing static mountain shape
      if daily candle data is unavailable.
    */
    console.warn(
      "Unable to update daily Bitcoin mountains:",
      error
    );

  } finally {
    mountainRequestInProgress =
      false;
  }
}


/* -------------------------------- */
/* WebSocket connection             */
/* -------------------------------- */

function clearReconnectTimer() {
  if (
    reconnectTimer !== null
  ) {
    clearTimeout(
      reconnectTimer
    );

    reconnectTimer = null;
  }
}


function scheduleWebSocketReconnect() {
  if (
    reconnectTimer !== null ||
    document.hidden
  ) {
    return;
  }


  reconnectTimer =
    setTimeout(
      () => {
        reconnectTimer = null;

        connectToCoinbaseWebSocket();
      },
      reconnectDelay
    );


  reconnectDelay =
    Math.min(
      reconnectDelay * 2,
      MAXIMUM_RECONNECT_DELAY
    );
}


function closeCurrentSocket() {
  if (!bitcoinSocket) {
    return;
  }


  bitcoinSocket.onopen = null;

  bitcoinSocket.onmessage = null;

  bitcoinSocket.onerror = null;

  bitcoinSocket.onclose = null;


  try {
    bitcoinSocket.close();

  } catch (error) {
    console.warn(
      "Unable to close Coinbase WebSocket:",
      error
    );
  }


  bitcoinSocket = null;
}


function connectToCoinbaseWebSocket() {
  if (document.hidden) {
    return;
  }


  if (
    bitcoinSocket &&
    (
      bitcoinSocket.readyState ===
        WebSocket.OPEN ||

      bitcoinSocket.readyState ===
        WebSocket.CONNECTING
    )
  ) {
    return;
  }


  clearReconnectTimer();

  closeCurrentSocket();


  try {
    bitcoinSocket =
      new WebSocket(
        WEBSOCKET_URL
      );

  } catch (error) {
    console.error(
      "Unable to create Coinbase WebSocket:",
      error
    );

    scheduleWebSocketReconnect();

    return;
  }


  bitcoinSocket.addEventListener(
    "open",
    () => {

      reconnectDelay =
        INITIAL_RECONNECT_DELAY;


      const subscription = {
        type: "subscribe",

        product_ids: [
          "BTC-USD"
        ],

        channels: [
          "ticker",
          "heartbeat"
        ]
      };


      bitcoinSocket.send(
        JSON.stringify(
          subscription
        )
      );


      console.log(
        "Connected to Coinbase live BTC feed."
      );
    }
  );


  bitcoinSocket.addEventListener(
    "message",
    event => {

      let message;


      try {
        message =
          JSON.parse(
            event.data
          );

      } catch (error) {
        console.warn(
          "Ignored invalid Coinbase message:",
          error
        );

        return;
      }


      if (
        message.type ===
          "ticker" &&

        message.product_id ===
          "BTC-USD"
      ) {
        const price =
          parseBitcoinPrice(
            message.price
          );


        if (
          price === null
        ) {
          return;
        }


        lastTickerMessageTime =
          Date.now();


        acceptLivePrice(
          price
        );


        return;
      }


      if (
        message.type ===
          "error"
      ) {
        console.error(
          "Coinbase WebSocket error message:",
          message.message ||
          message
        );
      }
    }
  );


  bitcoinSocket.addEventListener(
    "error",
    error => {
      console.warn(
        "Coinbase WebSocket connection error:",
        error
      );
    }
  );


  bitcoinSocket.addEventListener(
    "close",
    event => {

      bitcoinSocket = null;


      console.warn(
        "Coinbase WebSocket closed:",
        event.code,
        event.reason ||
        "No reason supplied"
      );


      scheduleWebSocketReconnect();
    }
  );
}


/* -------------------------------- */
/* REST fallback                    */
/* -------------------------------- */

async function requestFallbackPrice() {
  if (
    restRequestInProgress
  ) {
    return;
  }


  restRequestInProgress =
    true;


  try {
    const requestUrl =
      `${REST_PRICE_URL}?time=${
        Date.now()
      }`;


    const response =
      await fetch(
        requestUrl,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        `Fallback request failed: ${
          response.status
        }`
      );
    }


    const data =
      await response.json();


    const fallbackPrice =
      parseBitcoinPrice(
        data?.data?.amount
      );


    if (
      fallbackPrice === null
    ) {
      throw new Error(
        "Coinbase returned an invalid fallback price."
      );
    }


    acceptLivePrice(
      fallbackPrice
    );


  } catch (error) {
    console.error(
      "Unable to load fallback Bitcoin price:",
      error
    );


    if (
      bitcoinPriceElement &&
      latestBitcoinPrice === null
    ) {
      bitcoinPriceElement.textContent =
        "Connecting...";

      bitcoinPriceElement.style.color =
        "white";
    }

  } finally {
    restRequestInProgress =
      false;
  }
}


function checkLivePriceConnection() {
  if (
    document.hidden
  ) {
    return;
  }


  const currentTime =
    Date.now();


  const tickerIsStale =
    lastTickerMessageTime === 0 ||

    (
      currentTime -
      lastTickerMessageTime
    ) >
    STALE_PRICE_TIMEOUT;


  if (
    tickerIsStale
  ) {
    requestFallbackPrice();


    const socketIsUnavailable =
      !bitcoinSocket ||

      bitcoinSocket.readyState ===
        WebSocket.CLOSED ||

      bitcoinSocket.readyState ===
        WebSocket.CLOSING;


    if (
      socketIsUnavailable
    ) {
      connectToCoinbaseWebSocket();
    }
  }
}


/* -------------------------------- */
/* Real Bitcoin block event         */
/* -------------------------------- */

function formatBlockAge(
  blockTimestamp
) {
  if (
    !Number.isFinite(
      blockTimestamp
    )
  ) {
    return "Latest Bitcoin network tip";
  }


  const elapsedSeconds =
    Math.max(
      0,
      Math.floor(
        Date.now() / 1000 -
        blockTimestamp
      )
    );


  if (elapsedSeconds < 60) {
    return "Found just now";
  }


  const elapsedMinutes =
    Math.floor(
      elapsedSeconds / 60
    );


  if (elapsedMinutes < 60) {
    return `Found ${elapsedMinutes} ${
      elapsedMinutes === 1
        ? "minute"
        : "minutes"
    } ago`;
  }


  const elapsedHours =
    Math.floor(
      elapsedMinutes / 60
    );


  return `Found ${elapsedHours} ${
    elapsedHours === 1
      ? "hour"
      : "hours"
  } ago`;
}


function updateCurrentBlockAge() {
  if (!currentBlockAge) {
    return;
  }


  currentBlockAge.textContent =
    formatBlockAge(
      latestKnownBlockTimestamp
    );
}


function updateCurrentBlockPanel(
  blockHeight,
  blockTimestamp,
  highlight = false
) {
  if (currentBlockNumber) {
    currentBlockNumber.textContent =
      `#${Number(
        blockHeight
      ).toLocaleString(
        "en-US"
      )}`;
  }


  latestKnownBlockTimestamp =
    Number.isFinite(
      blockTimestamp
    )
      ? blockTimestamp
      : Math.floor(
          Date.now() / 1000
        );


  updateCurrentBlockAge();


  if (
    highlight &&
    currentBlockPanel
  ) {
    currentBlockPanel.classList.remove(
      "is-updated"
    );

    void currentBlockPanel.offsetWidth;

    currentBlockPanel.classList.add(
      "is-updated"
    );

    setTimeout(
      () => {
        currentBlockPanel.classList.remove(
          "is-updated"
        );
      },
      1100
    );
  }
}


async function requestBlockTimestamp(
  blockHeight
) {
  const hashResponse =
    await fetch(
      `${BLOCK_API_BASE_URL}/block-height/${blockHeight}`,
      {
        cache: "no-store"
      }
    );


  if (!hashResponse.ok) {
    throw new Error(
      `Block-hash request failed: ${
        hashResponse.status
      }`
    );
  }


  const blockHash =
    (
      await hashResponse.text()
    ).trim();


  if (!blockHash) {
    throw new Error(
      "The block service returned an empty block hash."
    );
  }


  const blockResponse =
    await fetch(
      `${BLOCK_API_BASE_URL}/block/${blockHash}`,
      {
        cache: "no-store"
      }
    );


  if (!blockResponse.ok) {
    throw new Error(
      `Block-details request failed: ${
        blockResponse.status
      }`
    );
  }


  const blockData =
    await blockResponse.json();


  const blockTimestamp =
    Number(
      blockData?.timestamp
    );


  if (
    !Number.isFinite(
      blockTimestamp
    ) ||
    blockTimestamp <= 0
  ) {
    throw new Error(
      "The block service returned an invalid timestamp."
    );
  }


  return blockTimestamp;
}


function clearBlockEvent() {
  if (
    blockEventCleanupTimer !== null
  ) {
    clearTimeout(
      blockEventCleanupTimer
    );

    blockEventCleanupTimer = null;
  }


  blockEventWorldX = null;

  blockEventLandingBottom = null;


  if (blockEventLayer) {
    blockEventLayer.classList.remove(
      "is-active"
    );
  }
}


function setBlockImpactLanding(
  smoothTerrainPoints =
    lastSmoothTerrainPoints
) {
  if (
    !blockImpactSite ||
    !Array.isArray(
      smoothTerrainPoints
    ) ||
    smoothTerrainPoints.length < 2
  ) {
    return;
  }


  const landingTerrain =
    sampleTerrainAtX(
      smoothTerrainPoints,
      BLOCK_EVENT_LANDING_X
    );


  const terrainHeight =
    400 - landingTerrain.y;


  blockEventWorldX =
    BLOCK_EVENT_LANDING_X;


  blockEventLandingBottom =
    (
      terrainHeight /
      400
    ) * 48 - 1.5;


  updateBlockImpactSitePosition();
}


function updateBlockImpactSitePosition() {
  if (
    !blockImpactSite ||
    blockEventWorldX === null ||
    blockEventLandingBottom === null
  ) {
    return;
  }


  blockImpactSite.style.left =
    `${
      (
        blockEventWorldX /
        1000
      ) * 100
    }%`;


  blockImpactSite.style.bottom =
    `${blockEventLandingBottom}%`;
}


function playBlockMinedEvent(
  blockHeight
) {
  if (
    document.hidden ||
    !blockEventLayer ||
    !blockMinedNumber
  ) {
    return;
  }


  clearBlockEvent();


  blockMinedNumber.textContent =
    `BLOCK #${
      Number(blockHeight).toLocaleString(
        "en-US"
      )
    }`;


  setBlockImpactLanding();


  /*
    Force a style read so the same reusable event can
    restart cleanly when another block is mined later.
  */
  void blockEventLayer.offsetWidth;


  blockEventLayer.classList.add(
    "is-active"
  );


  blockEventCleanupTimer =
    setTimeout(
      () => {
        blockEventLayer.classList.remove(
          "is-active"
        );

        blockEventCleanupTimer = null;
      },
      BLOCK_EVENT_CLEANUP_DELAY
    );
}


async function checkForNewBitcoinBlock() {
  if (
    document.hidden ||
    blockHeightRequestInProgress
  ) {
    return;
  }


  blockHeightRequestInProgress =
    true;


  try {
    const response =
      await fetch(
        `${BLOCK_HEIGHT_URL}?time=${Date.now()}`,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        `Block-height request failed: ${
          response.status
        }`
      );
    }


    const responseText =
      await response.text();


    const blockHeight =
      Number.parseInt(
        responseText.trim(),
        10
      );


    if (
      !Number.isSafeInteger(
        blockHeight
      ) ||
      blockHeight <= 0
    ) {
      throw new Error(
        "The block-height service returned invalid data."
      );
    }


    const isFirstBlockCheck =
      latestKnownBlockHeight === null;


    const isNewBlock =
      !isFirstBlockCheck &&
      blockHeight >
        latestKnownBlockHeight;


    if (
      !isFirstBlockCheck &&
      !isNewBlock
    ) {
      updateCurrentBlockAge();

      return;
    }


    latestKnownBlockHeight =
      blockHeight;


    let blockTimestamp;


    try {
      blockTimestamp =
        await requestBlockTimestamp(
          blockHeight
        );

    } catch (detailsError) {
      console.warn(
        "Unable to load the latest block timestamp:",
        detailsError
      );

      blockTimestamp =
        Math.floor(
          Date.now() / 1000
        );
    }


    updateCurrentBlockPanel(
      blockHeight,
      blockTimestamp,
      isNewBlock
    );


    /*
      Establish the starting height silently. The block
      drops only when a genuinely newer block appears
      after the page has begun watching.
    */
    if (isNewBlock) {
      playBlockMinedEvent(
        blockHeight
      );
    }


  } catch (error) {
    console.warn(
      "Unable to check the latest Bitcoin block:",
      error
    );

  } finally {
    blockHeightRequestInProgress =
      false;
  }
}


/* -------------------------------- */
/* Bitcoin terrain generation       */
/* -------------------------------- */

function updateTerrainFromLivePrices() {
  if (
    terrainPriceValues.length < 2
  ) {
    return;
  }


  const lowestPrice =
    Math.min(
      ...terrainPriceValues
    );


  const highestPrice =
    Math.max(
      ...terrainPriceValues
    );


  const actualPriceRange =
    highestPrice -
    lowestPrice;


  const displayedPriceRange =
    Math.max(
      actualPriceRange,
      LIVE_CHART_MINIMUM_PRICE_RANGE
    );


  const priceMidpoint =
    (
      highestPrice +
      lowestPrice
    ) /
    2;


  const displayedLowestPrice =
    priceMidpoint -
    displayedPriceRange /
    2;


  terrainYValues =
    terrainPriceValues.map(
      price => {

        const normalizedPrice =
          (
            price -
            displayedLowestPrice
          ) /
          displayedPriceRange;


        const y =
          LIVE_CHART_BOTTOM_Y -
          normalizedPrice *
          (
            LIVE_CHART_BOTTOM_Y -
            LIVE_CHART_TOP_Y
          );


        return clamp(
          y,
          LIVE_CHART_TOP_Y,
          LIVE_CHART_BOTTOM_Y
        );
      }
    );
}


function advanceTerrainPoint() {
  if (
    latestBitcoinPrice === null
  ) {
    return;
  }


  /*
    Start with a flat trail at the first valid live
    price. Every point after this is still driven by
    a real one-second BTC sample, but the vertical
    direction now carries momentum between samples.
  */
  if (
    terrainPriceValues.length === 0
  ) {
    terrainPriceValues =
      Array(
        CONTROL_POINT_COUNT
      ).fill(
        latestBitcoinPrice
      );


    terrainYValues =
      Array(
        CONTROL_POINT_COUNT
      ).fill(
        TERRAIN_CENTRE_Y
      );


    lastTerrainPrice =
      latestBitcoinPrice;


    currentTerrainSlope = 0;

    return;
  }


  const priceChange =
    latestBitcoinPrice -
    lastTerrainPrice;


  updateTrailStatus(
    priceChange
  );


  lastTerrainPrice =
    latestBitcoinPrice;


  terrainPriceValues.shift();


  terrainPriceValues.push(
    latestBitcoinPrice
  );


  const recentTrend =
    getRecentBitcoinTrend();


  const trendIsQuiet =
    Math.abs(recentTrend) <
    QUIET_TREND_THRESHOLD;


  /*
    Positive BTC momentum produces a negative SVG y
    slope, which makes the incoming trail climb.
    Negative momentum produces a descending trail.
  */
  const normalizedTrend =
    clamp(
      recentTrend /
        FULL_TREND_MOVE,
      -1,
      1
    );


  let targetSlope =
    trendIsQuiet
      ? 0
      : -normalizedTrend *
        MAXIMUM_TERRAIN_SLOPE;


  const previousTerrainY =
    terrainYValues[
      terrainYValues.length - 1
    ];


  /*
    Ease the trail before it reaches either vertical
    boundary. This preserves long hills without ever
    allowing a sudden cliff at the top or bottom.
  */
  if (
    targetSlope < 0 &&
    previousTerrainY <
      MINIMUM_TERRAIN_Y +
      TERRAIN_EDGE_SOFTENING
  ) {
    const upwardRoom =
      clamp(
        (
          previousTerrainY -
          MINIMUM_TERRAIN_Y
        ) /
          TERRAIN_EDGE_SOFTENING,
        0,
        1
      );

    targetSlope *= upwardRoom;
  }


  if (
    targetSlope > 0 &&
    previousTerrainY >
      MAXIMUM_TERRAIN_Y -
      TERRAIN_EDGE_SOFTENING
  ) {
    const downwardRoom =
      clamp(
        (
          MAXIMUM_TERRAIN_Y -
          previousTerrainY
        ) /
          TERRAIN_EDGE_SOFTENING,
        0,
        1
      );

    targetSlope *= downwardRoom;
  }


  const slopeResponse =
    trendIsQuiet
      ? QUIET_SLOPE_RESPONSE
      : SLOPE_RESPONSE;


  currentTerrainSlope +=
    (
      targetSlope -
      currentTerrainSlope
    ) *
    slopeResponse;


  currentTerrainSlope =
    clamp(
      currentTerrainSlope,
      -MAXIMUM_TERRAIN_SLOPE,
      MAXIMUM_TERRAIN_SLOPE
    );


  /*
    Add the latest real one-sample price change as a
    more pronounced local bump. Momentum controls the broad hill;
    this keeps the fine Bitcoin movement visible on top.
  */
  const normalizedPriceBump =
    clamp(
      priceChange /
        SMALL_PRICE_FULL_MOVE,
      -1,
      1
    );


  const smallPriceBump =
    -Math.sign(normalizedPriceBump) *
    Math.sqrt(
      Math.abs(normalizedPriceBump)
    ) *
    MAXIMUM_SMALL_PRICE_BUMP;


  /*
    Soften the local bump near the terrain limits too,
    preventing the small texture from forming a hard edge.
  */
  let softenedSmallPriceBump =
    smallPriceBump;


  if (
    softenedSmallPriceBump < 0 &&
    previousTerrainY <
      MINIMUM_TERRAIN_Y +
      TERRAIN_EDGE_SOFTENING
  ) {
    softenedSmallPriceBump *=
      clamp(
        (
          previousTerrainY -
          MINIMUM_TERRAIN_Y
        ) /
          TERRAIN_EDGE_SOFTENING,
        0,
        1
      );
  }


  if (
    softenedSmallPriceBump > 0 &&
    previousTerrainY >
      MAXIMUM_TERRAIN_Y -
      TERRAIN_EDGE_SOFTENING
  ) {
    softenedSmallPriceBump *=
      clamp(
        (
          MAXIMUM_TERRAIN_Y -
          previousTerrainY
        ) /
          TERRAIN_EDGE_SOFTENING,
        0,
        1
      );
  }


  const nextTerrainY =
    clamp(
      previousTerrainY +
        currentTerrainSlope +
        softenedSmallPriceBump,
      MINIMUM_TERRAIN_Y,
      MAXIMUM_TERRAIN_Y
    );


  /*
    If a boundary is reached, remove only the part of
    the slope pushing farther out. The trail then
    levels naturally instead of stacking points into
    a sharp wall.
  */
  if (
    (
      nextTerrainY ===
        MINIMUM_TERRAIN_Y &&
      currentTerrainSlope < 0
    ) ||
    (
      nextTerrainY ===
        MAXIMUM_TERRAIN_Y &&
      currentTerrainSlope > 0
    )
  ) {
    currentTerrainSlope *= 0.5;
  }


  terrainYValues.shift();


  terrainYValues.push(
    nextTerrainY
  );
}


function getScrollingControlPoints() {
  return terrainYValues.map(
    (
      terrainY,
      index
    ) => {

      return {
        x:
          (
            index - 1
          ) *
          POINT_SPACING -
          scrollOffset,

        y:
          terrainY
      };
    }
  );
}


/* -------------------------------- */
/* Terrain curve calculation        */
/* -------------------------------- */

function getCatmullRomPoint(
  point0,
  point1,
  point2,
  point3,
  progress
) {

  const progressSquared =
    progress *
    progress;


  const progressCubed =
    progressSquared *
    progress;


  const x =
    0.5 *
    (
      2 *
      point1.x +

      (
        -point0.x +
        point2.x
      ) *
      progress +

      (
        2 *
        point0.x -

        5 *
        point1.x +

        4 *
        point2.x -

        point3.x
      ) *
      progressSquared +

      (
        -point0.x +

        3 *
        point1.x -

        3 *
        point2.x +

        point3.x
      ) *
      progressCubed
    );


  const y =
    0.5 *
    (
      2 *
      point1.y +

      (
        -point0.y +
        point2.y
      ) *
      progress +

      (
        2 *
        point0.y -

        5 *
        point1.y +

        4 *
        point2.y -

        point3.y
      ) *
      progressSquared +

      (
        -point0.y +

        3 *
        point1.y -

        3 *
        point2.y +

        point3.y
      ) *
      progressCubed
    );


  return {
    x,
    y
  };
}


function createSmoothTerrainPoints(
  controlPoints
) {

  const smoothPoints = [];


  const sectionsPerSegment =
    4;


  for (
    let index = 0;

    index <
    controlPoints.length - 1;

    index++
  ) {

    const point0 =
      controlPoints[
        Math.max(
          0,
          index - 1
        )
      ];


    const point1 =
      controlPoints[
        index
      ];


    const point2 =
      controlPoints[
        index + 1
      ];


    const point3 =
      controlPoints[
        Math.min(
          controlPoints.length - 1,
          index + 2
        )
      ];


    for (
      let section = 0;

      section <
      sectionsPerSegment;

      section++
    ) {

      const progress =
        section /
        sectionsPerSegment;


      smoothPoints.push(
        getCatmullRomPoint(
          point0,
          point1,
          point2,
          point3,
          progress
        )
      );
    }
  }


  smoothPoints.push(
    controlPoints[
      controlPoints.length - 1
    ]
  );


  return smoothPoints;
}


function createTerrainPath(
  points
) {

  if (
    points.length < 2
  ) {
    return "";
  }


  let path =
    `M ${
      points[0].x.toFixed(2)
    }` +

    ` ${
      points[0].y.toFixed(2)
    }`;


  for (
    let index = 1;

    index <
    points.length;

    index++
  ) {

    path +=
      ` L ${
        points[index].x.toFixed(2)
      }` +

      ` ${
        points[index].y.toFixed(2)
      }`;
  }


  path +=
    " L 1100 400" +
    " L -100 400" +
    " Z";


  return path;
}


/* -------------------------------- */
/* Rider hill-following             */
/* -------------------------------- */

function sampleTerrainAtX(
  points,
  targetX
) {

  for (
    let index = 0;

    index <
    points.length - 1;

    index++
  ) {

    const firstPoint =
      points[index];


    const secondPoint =
      points[
        index + 1
      ];


    if (
      targetX >=
        firstPoint.x &&

      targetX <=
        secondPoint.x
    ) {

      const horizontalDistance =
        secondPoint.x -
        firstPoint.x;


      const progress =
        horizontalDistance === 0

          ? 0

          : (
              targetX -
              firstPoint.x
            ) /
            horizontalDistance;


      const y =
        firstPoint.y +

        (
          secondPoint.y -
          firstPoint.y
        ) *
        progress;


      const slopeAngle =
        Math.atan2(
          secondPoint.y -
          firstPoint.y,

          secondPoint.x -
          firstPoint.x
        ) *

        (
          180 /
          Math.PI
        );


      return {
        y,

        angle:
          slopeAngle
      };
    }
  }


  return {
    y:
      TERRAIN_CENTRE_Y,

    angle:
      0
  };
}


function moveRiderWithTerrain(
  smoothTerrainPoints
) {

  if (!rider) {
    return;
  }


  const riderTerrain =
    sampleTerrainAtX(
      smoothTerrainPoints,
      500
    );


  const terrainHeight =
    400 -
    riderTerrain.y;


  const riderBottom =
    (
      terrainHeight /
      400
    ) *
    48;


  rider.style.bottom =
    `${
      riderBottom - 4
    }%`;


  /*
    Follow the terrain angle while limiting rotation
    so the rider feels attached to the trail without
    becoming uncomfortable on sharper market moves.
  */
  /*
    The mascot faces right. A negative angle leans it
    back while climbing; a positive angle leans it
    forward while descending. Slight amplification
    makes the movement easier to see at the faster
    trail speed while keeping the rotation controlled.
  */
  const RIDER_TILT_MULTIPLIER = 1.45;

  const MAXIMUM_RIDER_TILT = 20;


  const riderAngle =
    clamp(
      riderTerrain.angle *
        RIDER_TILT_MULTIPLIER,
      -MAXIMUM_RIDER_TILT,
      MAXIMUM_RIDER_TILT
    );


  rider.style.transform =
    `translateX(-50%) rotate(${riderAngle.toFixed(2)}deg)`;
}


/* -------------------------------- */
/* Terrain rendering                */
/* -------------------------------- */

function renderTerrain() {
  if (!hillShape) {
    return;
  }


  const controlPoints =
    getScrollingControlPoints();


  const smoothTerrainPoints =
    createSmoothTerrainPoints(
      controlPoints
    );


  lastSmoothTerrainPoints =
    smoothTerrainPoints;


  const terrainPath =
    createTerrainPath(
      smoothTerrainPoints
    );


  hillShape.setAttribute(
    "d",
    terrainPath
  );


  moveRiderWithTerrain(
    smoothTerrainPoints
  );


  /*
    The landed block is not re-sampled at a fixed screen
    position. Its landing height stays fixed while its world
    x-position moves left, allowing the centred rider to pass it.
  */
  updateBlockImpactSitePosition();
}


function animateTerrain(
  currentTime
) {

  if (
    lastAnimationTime === null
  ) {

    lastAnimationTime =
      currentTime;


    lastRenderTime =
      currentTime;
  }


  let elapsedTime =
    currentTime -
    lastAnimationTime;


  elapsedTime =
    Math.min(
      elapsedTime,
      100
    );


  lastAnimationTime =
    currentTime;


  scrollOffset +=
    SCROLL_SPEED *

    (
      elapsedTime /
      1000
    );


  if (
    blockEventLayer &&
    blockEventLayer.classList.contains(
      "is-active"
    ) &&
    blockEventWorldX !== null
  ) {
    blockEventWorldX -=
      BLOCK_EVENT_WORLD_SPEED *
      (
        elapsedTime /
        1000
      );

    updateBlockImpactSitePosition();
  }


  while (
    scrollOffset >=
    POINT_SPACING
  ) {

    scrollOffset -=
      POINT_SPACING;


    advanceTerrainPoint();
  }


  if (
    currentTime -
    lastRenderTime >=
    TERRAIN_FRAME_INTERVAL
  ) {

    renderTerrain();


    lastRenderTime =
      currentTime;
  }


  terrainAnimationFrame =
    requestAnimationFrame(
      animateTerrain
    );
}


window.addEventListener(
  "resize",
  () => {
    requestAnimationFrame(
      positionDailyPeakLabel
    );
  }
);


/* -------------------------------- */
/* Browser visibility handling      */
/* -------------------------------- */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      clearReconnectTimer();

      closeCurrentSocket();

      return;
    }


    lastAnimationTime =
      performance.now();


    lastRenderTime =
      performance.now();


    connectToCoinbaseWebSocket();


    requestFallbackPrice();


    /*
      Refresh the daily chart when returning
      to the browser tab.
    */
    updateDailyMountains();


    checkForNewBitcoinBlock();
  }
);


window.addEventListener(
  "beforeunload",
  () => {

    clearReconnectTimer();

    clearBlockEvent();

    closeCurrentSocket();
  }
);


/* -------------------------------- */
/* Start the project                */
/* -------------------------------- */

renderTerrain();


terrainAnimationFrame =
  requestAnimationFrame(
    animateTerrain
  );


requestFallbackPrice();


connectToCoinbaseWebSocket();


/*
  Load today's mountain chart once.
*/
updateDailyMountains();


/*
  Establish the current chain tip without playing an
  event for a block that existed before the page opened.
*/
checkForNewBitcoinBlock();


setInterval(
  checkLivePriceConnection,
  CONNECTION_CHECK_INTERVAL
);


/*
  Refresh the daily mountain chart only
  once every 15 minutes.
*/
setInterval(
  updateDailyMountains,
  DAILY_MOUNTAIN_REFRESH_INTERVAL
);


/*
  Check for a newly mined Bitcoin block twice per minute.
  The request returns only one small integer.
*/
setInterval(
  checkForNewBitcoinBlock,
  BLOCK_HEIGHT_CHECK_INTERVAL
);


/*
  Keep the permanent sign's "Found ... ago" text current
  without making any extra network requests.
*/
setInterval(
  updateCurrentBlockAge,
  BLOCK_AGE_UPDATE_INTERVAL
);
