// ─── Particle System ───────────────────────────────────────────────────────────
(function () {
  const container = document.getElementById('particles');
  const colors = ['#00d4ff', '#4f8ef7', '#00ff88', '#a855f7', '#ff7a00'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 20 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
})();

// ─── Metrics Counter Animation ─────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const metricsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.metric-value').forEach(animateCounter);
      metricsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
const metricsSection = document.getElementById('metrics');
if (metricsSection) metricsObserver.observe(metricsSection);

// ─── Hero Mini Pipeline Animation ─────────────────────────────────────────────
const heroNodes = ['mn1','mn2','mn3','mn4','mn5'];
const heroArrows = ['ma1','ma2','ma3','ma4'];
let heroIdx = 0;
let heroDone = [];
function cycleHeroNode() {
  heroNodes.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (heroDone.includes(i)) el.classList.add('done');
    if (i === heroIdx) el.classList.add('active');
  });
  heroIdx++;
  if (heroIdx < heroNodes.length) {
    heroDone.push(heroIdx - 1);
    setTimeout(cycleHeroNode, 1000);
  } else {
    // restart
    setTimeout(() => {
      heroIdx = 0; heroDone = [];
      cycleHeroNode();
    }, 2000);
  }
}
cycleHeroNode();

// ─── Live Demo Pipeline ────────────────────────────────────────────────────────
const stages = ['checkout', 'build', 'test', 'docker', 'deploy'];
const stageDurations = [1200, 1800, 2000, 1500, 1300];
const stageLogs = {
  checkout: [
    '$ Cloning repository: github.com/user/app.git',
    '$ Fetching latest commit: a3f9d2c',
    '✓ Checkout complete'
  ],
  build:    [
    '$ npm install --production',
    '$ npm run build',
    '✓ Build artifacts generated'
  ],
  test:     [
    '$ Running 48 unit tests...',
    '$ Running integration tests...',
    '✓ All tests passed (48/48)'
  ],
  docker:   [
    '$ docker build -t myapp:a3f9d2c .',
    '$ docker push registry/myapp:a3f9d2c',
    '✓ Image pushed to registry'
  ],
  deploy:   [
    '$ kubectl apply -f k8s/deployment.yaml',
    '$ kubectl rollout status deployment/myapp',
    '✓ Deployment successful — 3/3 pods running'
  ]
};

let demoRunning = false;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function setLog(text) {
  const log = document.getElementById('demoLog');
  log.innerHTML = `<span class="log-prompt">$</span> ${text}`;
}

function appendLog(text) {
  const log = document.getElementById('demoLog');
  log.innerHTML += `\n${text}`;
}

function resetDemoUI() {
  stages.forEach(s => {
    const ds = document.getElementById(`ds-${s}`);
    const st = document.getElementById(`st-${s}`);
    const fill = document.getElementById(`fill-${s}`);
    ds.className = 'demo-stage';
    st.textContent = 'pending';
    fill.style.width = '0%';
    fill.style.transition = '';
  });
  const result = document.getElementById('demoResult');
  result.textContent = '';
  result.className = 'demo-result';
  setLog('Waiting for pipeline trigger...');
  demoRunning = false;
}

async function runStage(stageId, duration, logs) {
  const ds  = document.getElementById(`ds-${stageId}`);
  const st  = document.getElementById(`st-${stageId}`);
  const fill = document.getElementById(`fill-${stageId}`);

  ds.className = 'demo-stage running';
  st.textContent = 'running...';
  fill.style.transition = `width ${duration}ms linear`;
  fill.style.width = '100%';

  setLog(logs[0]);
  await sleep(duration * 0.35);
  appendLog(logs[1]);
  await sleep(duration * 0.35);
  appendLog(logs[2]);
  await sleep(duration * 0.3);

  ds.className = 'demo-stage success';
  st.textContent = '✓ passed';
}

document.getElementById('startDemo').addEventListener('click', async () => {
  if (demoRunning) return;
  demoRunning = true;
  resetDemoUI();
  await sleep(50);
  setLog('🚀 Pipeline triggered by GitHub push event...');
  await sleep(600);

  for (let i = 0; i < stages.length; i++) {
    await runStage(stages[i], stageDurations[i], stageLogs[stages[i]]);
    await sleep(300);
  }

  const result = document.getElementById('demoResult');
  result.textContent = '🎉 Pipeline SUCCESS — Deployed to Production!';
  result.className = 'demo-result success';
  demoRunning = false;
});

document.getElementById('resetDemo').addEventListener('click', resetDemoUI);

// Run pipeline button in hero also triggers demo scroll + start
document.getElementById('runPipelineBtn').addEventListener('click', () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    if (!demoRunning) document.getElementById('startDemo').click();
  }, 800);
});

// ─── Scroll-in Stage Cards ────────────────────────────────────────────────────
const stageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.stage').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateX(-30px)';
  el.style.transition = `all 0.5s ease ${i * 0.1}s`;
  stageObserver.observe(el);
});

// ─── Scroll-in Stack Cards ────────────────────────────────────────────────────
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.stack-card, .metric-card, .arch-node').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = `all 0.5s ease ${i * 0.1}s`;
  cardObserver.observe(el);
});
