<!-- Main Dashboard -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SnippetMinds - Developer Dashboard</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<!-- Material Icons -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "primary-hover": "#0f65bd",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-dark": "#182430",
                        "surface-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for a cleaner look */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
            background: #2d3b4e; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #3b4d66; 
        }
        
        /* Code syntax highlighting mock colors */
        .token-keyword { color: #c678dd; }
        .token-function { color: #61afef; }
        .token-string { color: #98c379; }
        .token-comment { color: #5c6370; font-style: italic; }
        .token-operator { color: #56b6c2; }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased h-screen flex flex-col overflow-hidden selection:bg-primary/30 selection:text-primary">
<!-- Top Navigation / Header -->
<header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark flex items-center px-4 justify-between shrink-0 z-20">
<!-- Logo Area -->
<div class="flex items-center gap-3 w-64">
<div class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
<span class="material-icons-round text-white text-xl">code</span>
</div>
<span class="font-bold text-lg tracking-tight text-slate-900 dark:text-white">SnippetMinds</span>
</div>
<!-- Search Bar (Center) -->
<div class="flex-1 max-w-2xl px-4">
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-icons-round text-slate-400 group-focus-within:text-primary transition-colors">search</span>
</div>
<input class="block w-full pl-10 pr-20 py-2.5 rounded-lg border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-background-dark text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm" placeholder="Ask Ollama or search snippets..." type="text"/>
<div class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
<span class="text-xs text-slate-500 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">⌘ K</span>
</div>
</div>
</div>
<!-- Right Actions -->
<div class="flex items-center gap-4 w-64 justify-end">
<!-- Theme Toggle Mock -->
<button class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-icons-round text-xl">notifications_none</span>
</button>
<button class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
<span class="material-icons-round text-lg">add</span>
<span>New Snippet</span>
</button>
<div class="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800 cursor-pointer">
<img alt="User Avatar" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcBjj8HBeBubNIlAVJh0mWbKXnczpgrqXPedealEiBedv5JH1mF3y1J89_nwVadkmEEAh-AEv2rHNx2IOm4rkBZn_mWbSpXITaSRUNhXQP3oljfNuS18saaDdoBBBV0RZV7HZfGpJsJ9cKjc0vQ4QePQrqCHA9AJsn2sz-kwsL4Fd8hB15cswAujRj89XMZj5Tm13LgPUMZEw_sPCBpxrgXBjXHHnOqyYlt6Z1pMLLVmPUFMp4mkJKWFGqRYDqdzY-We0540IT81Xq"/>
</div>
</div>
</header>
<!-- Main Layout -->
<div class="flex flex-1 overflow-hidden">
<!-- Sidebar -->
<aside class="w-64 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
<div class="p-4 space-y-6">
<!-- Main Nav -->
<nav class="space-y-1">
<a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium" href="#">
<span class="material-icons-round text-xl">dashboard</span>
                        Library
                    </a>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">
<span class="material-icons-round text-xl">favorite_border</span>
                        Favorites
                    </a>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">
<span class="material-icons-round text-xl">history</span>
                        Recent
                    </a>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">
<span class="material-icons-round text-xl">delete_outline</span>
                        Trash
                    </a>
</nav>
<!-- Languages / Tags -->
<div>
<h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Languages</h3>
<div class="flex flex-wrap gap-2 px-1">
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary transition-colors">
<span class="w-2 h-2 rounded-full bg-yellow-400"></span> JS
                        </button>
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary transition-colors">
<span class="w-2 h-2 rounded-full bg-blue-500"></span> TS
                        </button>
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary transition-colors">
<span class="w-2 h-2 rounded-full bg-green-500"></span> Python
                        </button>
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary transition-colors">
<span class="w-2 h-2 rounded-full bg-orange-500"></span> Rust
                        </button>
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary transition-colors">
<span class="w-2 h-2 rounded-full bg-cyan-400"></span> Go
                        </button>
<button class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary transition-colors">
<span class="w-2 h-2 rounded-full bg-purple-400"></span> SQL
                        </button>
</div>
</div>
</div>
<!-- Sidebar Footer / Status -->
<div class="p-4 border-t border-slate-200 dark:border-slate-800">
<div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-slate-700/50">
<div class="relative flex h-3 w-3">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
</div>
<div>
<p class="text-xs font-semibold text-slate-700 dark:text-slate-200">Ollama AI</p>
<p class="text-[10px] text-slate-500 dark:text-slate-400">Model: llama3-7b</p>
</div>
</div>
</div>
</aside>
<!-- Content Area -->
<main class="flex-1 overflow-y-auto p-6 lg:p-8">
<!-- Context Header -->
<div class="flex items-center justify-between mb-8">
<div>
<h1 class="text-2xl font-bold text-slate-900 dark:text-white">All Snippets</h1>
<p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Found 128 snippets matching your criteria</p>
</div>
<div class="flex items-center gap-2">
<button class="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors" title="Grid View">
<span class="material-icons-round">grid_view</span>
</button>
<button class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors" title="List View">
<span class="material-icons-round">view_list</span>
</button>
<div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
<select class="bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 border-none focus:ring-0 cursor-pointer pr-8">
<option>Sort by: Newest</option>
<option>Sort by: Name</option>
<option>Sort by: Popular</option>
</select>
</div>
</div>
<!-- Snippet Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
<!-- Card 1: React Hook -->
<div class="group relative bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col">
<div class="p-5 flex-1">
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center">
<span class="text-xs font-bold text-blue-500">TS</span>
</div>
<h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">useDebounce Hook</h3>
</div>
<button class="text-slate-400 hover:text-yellow-500 transition-colors">
<span class="material-icons-round text-xl">star</span>
</button>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                            A custom hook to delay the execution of a function until a specified time has passed.
                        </p>
<!-- Code Preview -->
<div class="bg-background-light dark:bg-background-dark rounded-lg p-3 font-mono text-xs border border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors overflow-hidden relative">
<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="bg-surface-light dark:bg-surface-dark p-1.5 rounded shadow-sm hover:text-primary transition-colors">
<span class="material-icons-round text-sm">content_copy</span>
</button>
</div>
<pre><code><span class="token-keyword">export</span> <span class="token-keyword">function</span> <span class="token-function">useDebounce</span><span class="token-operator">&lt;</span>T<span class="token-operator">&gt;</span>(
  value<span class="token-operator">:</span> T, 
  delay<span class="token-operator">?:</span> number
)<span class="token-operator">:</span> T {
  <span class="token-keyword">const</span> [debouncedValue, setDebouncedValue] = <span class="token-function">useState</span><span class="token-operator">&lt;</span>T<span class="token-operator">&gt;</span>(value)
  <span class="token-comment">// ... implementation</span>
}</code></pre>
</div>
</div>
<div class="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">#react</span>
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">#hooks</span>
<div class="ml-auto text-[10px] text-slate-400">Updated 2h ago</div>
</div>
</div>
<!-- Card 2: Python Utility -->
<div class="group relative bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col">
<div class="p-5 flex-1">
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-green-500/10 flex items-center justify-center">
<span class="text-xs font-bold text-green-500">PY</span>
</div>
<h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">CSV to JSON Parser</h3>
</div>
<button class="text-slate-400 hover:text-yellow-500 transition-colors">
<span class="material-icons-round text-xl">star_border</span>
</button>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                            Efficiently parse large CSV files into JSON format using pandas chunking.
                        </p>
<!-- Code Preview -->
<div class="bg-background-light dark:bg-background-dark rounded-lg p-3 font-mono text-xs border border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors overflow-hidden relative">
<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="bg-surface-light dark:bg-surface-dark p-1.5 rounded shadow-sm hover:text-primary transition-colors">
<span class="material-icons-round text-sm">content_copy</span>
</button>
</div>
<pre><code><span class="token-keyword">import</span> pandas <span class="token-keyword">as</span> pd

<span class="token-keyword">def</span> <span class="token-function">csv_to_json</span>(file_path):
df = pd.<span class="token-function">read_csv</span>(file_path)
<span class="token-keyword">return</span> df.<span class="token-function">to_json</span>(orient=<span class="token-string">'records'</span>)</code></pre>

</div>
</div>
<div class="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">#data</span>
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">#pandas</span>
<div class="ml-auto text-[10px] text-slate-400">Updated 1d ago</div>
</div>
</div>
<!-- Card 3: Docker Config -->
<div class="group relative bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col">
<div class="p-5 flex-1">
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-cyan-500/10 flex items-center justify-center">
<span class="text-xs font-bold text-cyan-500">YML</span>
</div>
<h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Postgres Docker Compose</h3>
</div>
<button class="text-slate-400 hover:text-yellow-500 transition-colors">
<span class="material-icons-round text-xl">star_border</span>
</button>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                            Standard docker-compose setup for PostgreSQL with persistent volume.
                        </p>
<!-- Code Preview -->
<div class="bg-background-light dark:bg-background-dark rounded-lg p-3 font-mono text-xs border border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors overflow-hidden relative">
<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="bg-surface-light dark:bg-surface-dark p-1.5 rounded shadow-sm hover:text-primary transition-colors">
<span class="material-icons-round text-sm">content_copy</span>
</button>
</div>
<pre><code><span class="token-keyword">services:</span>
  <span class="token-function">db:</span>
    <span class="token-keyword">image:</span> postgres:14-alpine
    <span class="token-keyword">environment:</span>
      <span class="token-keyword">POSTGRES_USER:</span> admin
      <span class="token-keyword">POSTGRES_PASSWORD:</span> secret</code></pre>
</div>
</div>
<div class="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">#docker</span>
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">#db</span>
<div class="ml-auto text-[10px] text-slate-400">Updated 3d ago</div>
</div>
</div>
<!-- Card 4: CSS Animation -->
<div class="group relative bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col">
<div class="p-5 flex-1">
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-pink-500/10 flex items-center justify-center">
<span class="text-xs font-bold text-pink-500">CSS</span>
</div>
<h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Fade In Up Animation</h3>
</div>
<button class="text-slate-400 hover:text-yellow-500 transition-colors">
<span class="material-icons-round text-xl">star</span>
</button>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                            Smooth entry animation keyframes for UI elements.
                        </p>
<!-- Code Preview -->
<div class="bg-background-light dark:bg-background-dark rounded-lg p-3 font-mono text-xs border border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors overflow-hidden relative">
<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="bg-surface-light dark:bg-surface-dark p-1.5 rounded shadow-sm hover:text-primary transition-colors">
<span class="material-icons-round text-sm">content_copy</span>
</button>
</div>
<pre><code><span class="token-string">@keyframes</span> <span class="token-function">fadeInUp</span> {
  <span class="token-keyword">from</span> {
    <span class="token-function">opacity</span>: 0;
    <span class="token-function">transform</span>: translateY(20px);
  }
  <span class="token-keyword">to</span> { <span class="token-function">opacity</span>: 1; <span class="token-function">transform</span>: translateY(0); }
}</code></pre>
</div>
</div>
<div class="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300">#css</span>
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">#ui</span>
<div class="ml-auto text-[10px] text-slate-400">Updated 1w ago</div>
</div>
</div>
<!-- Card 5: SQL Query -->
<div class="group relative bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col">
<div class="p-5 flex-1">
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded bg-purple-500/10 flex items-center justify-center">
<span class="text-xs font-bold text-purple-500">SQL</span>
</div>
<h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">User Retention Query</h3>
</div>
<button class="text-slate-400 hover:text-yellow-500 transition-colors">
<span class="material-icons-round text-xl">star_border</span>
</button>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                            Complex query to calculate monthly user retention cohorts.
                        </p>
<!-- Code Preview -->
<div class="bg-background-light dark:bg-background-dark rounded-lg p-3 font-mono text-xs border border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors overflow-hidden relative">
<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="bg-surface-light dark:bg-surface-dark p-1.5 rounded shadow-sm hover:text-primary transition-colors">
<span class="material-icons-round text-sm">content_copy</span>
</button>
</div>
<pre><code><span class="token-keyword">SELECT</span> 
  <span class="token-function">date_trunc</span>(<span class="token-string">'month'</span>, created_at) <span class="token-keyword">as</span> cohort,
  <span class="token-function">count</span>(distinct user_id) <span class="token-keyword">as</span> users
<span class="token-keyword">FROM</span> users
<span class="token-keyword">GROUP BY</span> 1</code></pre>
</div>
</div>
<div class="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
<span class="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">#analytics</span>
<div class="ml-auto text-[10px] text-slate-400">Updated 2w ago</div>
</div>
</div>
<!-- Generate with AI Empty State / Promo -->
<div class="group relative bg-gradient-to-br from-primary/10 to-transparent border border-dashed border-primary/30 rounded-xl hover:border-primary/60 transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[280px]">
<div class="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span class="material-icons-round text-primary text-2xl">auto_awesome</span>
</div>
<h3 class="font-semibold text-slate-900 dark:text-white mb-2">Can't find what you need?</h3>
<p class="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                        Ask Ollama to generate a new snippet for you based on your description.
                    </p>
<button class="px-4 py-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors shadow-sm">
                        Generate Snippet
                    </button>
</div>
</div>
</main>
</div>
</body></html>

<!-- Snippet Detail View -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Snippet Detail View</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "primary-dark": "#0e64bd",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-dark": "#16202c",
                        "surface-darker": "#0b1219",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for code blocks */
        .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #2d3748;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #4a5568;
        }
        
        /* Syntax Highlighting Colors Simulation */
        .token-keyword { color: #c678dd; }
        .token-function { color: #61afef; }
        .token-string { color: #98c379; }
        .token-comment { color: #5c6370; font-style: italic; }
        .token-class { color: #e5c07b; }
        .token-operator { color: #56b6c2; }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col">
<!-- Top Navigation / Header -->
<header class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
<div class="flex items-center gap-4">
<button class="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors">
<span class="material-icons">arrow_back</span>
</button>
<nav class="hidden sm:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
<span class="hover:text-primary cursor-pointer transition-colors">Library</span>
<span class="material-icons text-base mx-2 text-slate-600">chevron_right</span>
<span class="hover:text-primary cursor-pointer transition-colors">TypeScript</span>
<span class="material-icons text-base mx-2 text-slate-600">chevron_right</span>
<span class="text-slate-900 dark:text-white">Utilities</span>
</nav>
</div>
<div class="flex items-center gap-3">
<div class="relative group">
<button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all">
<span class="material-icons text-sm">auto_awesome</span>
<span class="text-sm font-medium">Ask Ollama</span>
</button>
</div>
<div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
<button class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Edit">
<span class="material-icons text-xl">edit</span>
</button>
<button class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
<span class="material-icons text-xl">delete_outline</span>
</button>
<button class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
<span class="material-icons text-sm">ios_share</span>
                    Share
                </button>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
<!-- Center Column: Content -->
<div class="flex-grow lg:w-2/3 xl:w-3/4 space-y-8">
<!-- Snippet Header -->
<div class="space-y-4">
<div class="flex flex-wrap items-start justify-between gap-4">
<h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Async Data Fetching Utility</h1>
<div class="flex items-center gap-2">
<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">TypeScript</span>
<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Network</span>
</div>
</div>
<div class="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-6">
<div class="flex items-center gap-1.5">
<span class="material-icons text-base">schedule</span>
<span>Updated 2h ago</span>
</div>
<div class="flex items-center gap-1.5">
<span class="material-icons text-base">folder_open</span>
<span>/utils/network</span>
</div>
<div class="flex items-center gap-1.5">
<span class="material-icons text-base text-yellow-500">star</span>
<span>Complexity: Low</span>
</div>
</div>
</div>
<!-- Description / Documentation -->
<div class="prose prose-invert max-w-none text-slate-300">
<p class="text-lg leading-relaxed">
                    This utility creates a wrapper around the native <code class="text-sm bg-slate-800 px-1.5 py-0.5 rounded text-primary font-mono">fetch</code> API. It automatically handles JSON parsing, adds timeout support, and implements a basic retry mechanism for failed requests. Ideally used for lightweight projects where Axios is overkill.
                </p>
<ul class="list-disc pl-5 space-y-2 mt-4 text-slate-400">
<li>Supports generic return types for type safety.</li>
<li>Default timeout set to 5000ms.</li>
<li>Throws structured errors on non-200 responses.</li>
</ul>
</div>
<!-- Code Block -->
<div class="relative group rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl bg-surface-darker">
<!-- Code Header -->
<div class="flex items-center justify-between px-4 py-3 bg-surface-dark border-b border-slate-700/50">
<div class="flex items-center gap-2">
<div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
<div class="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
<div class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
<span class="ml-3 text-xs font-mono text-slate-500">fetch-wrapper.ts</span>
</div>
<div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button class="text-xs flex items-center gap-1.5 text-slate-400 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-slate-800">
<span class="material-icons text-sm">play_arrow</span>
                            Run
                        </button>
<button class="text-xs flex items-center gap-1.5 text-white bg-primary hover:bg-primary-dark transition-colors px-3 py-1.5 rounded-lg shadow-lg shadow-primary/20">
<span class="material-icons text-sm">content_copy</span>
                            Copy
                        </button>
</div>
</div>
<!-- Code Content -->
<div class="p-0 overflow-x-auto custom-scrollbar">
<pre class="text-sm font-mono leading-relaxed p-6 min-w-full inline-block"><span class="token-keyword">interface</span> <span class="token-class">FetchOptions</span> <span class="token-keyword">extends</span> <span class="token-class">RequestInit</span> {
  <span class="token-string">timeout?</span>: <span class="token-keyword">number</span>;
  <span class="token-string">retries?</span>: <span class="token-keyword">number</span>;
}

<span class="token-comment">/\*\*

- Generic fetch wrapper with timeout and retry logic
  \*/</span>
  <span class="token-keyword">export async function</span> <span class="token-function">fetchData</span>&lt;<span class="token-class">T</span>&gt;(
  <span class="token-string">url</span>: <span class="token-keyword">string</span>,
  <span class="token-string">options</span>: <span class="token-class">FetchOptions</span> = {}
  ): <span class="token-keyword">Promise</span>&lt;<span class="token-class">T</span>&gt; {
  <span class="token-keyword">const</span> { <span class="token-string">timeout</span> = <span class="token-keyword">5000</span>, <span class="token-string">retries</span> = <span class="token-keyword">3</span>, ...<span class="token-string">config</span> } = <span class="token-string">options</span>;

<span class="token-keyword">const</span> <span class="token-function">controller</span> = <span class="token-keyword">new</span> <span class="token-class">AbortController</span>();
<span class="token-keyword">const</span> <span class="token-function">id</span> = <span class="token-function">setTimeout</span>(() =&gt; <span class="token-function">controller</span>.<span class="token-function">abort</span>(), <span class="token-string">timeout</span>);

<span class="token-keyword">try</span> {
<span class="token-keyword">const</span> <span class="token-function">response</span> = <span class="token-keyword">await</span> <span class="token-function">fetch</span>(<span class="token-string">url</span>, {
...<span class="token-string">config</span>,
<span class="token-string">signal</span>: <span class="token-function">controller</span>.<span class="token-string">signal</span>
});

    <span class="token-function">clearTimeout</span>(<span class="token-function">id</span>);

    <span class="token-keyword">if</span> (!<span class="token-function">response</span>.<span class="token-string">ok</span>) {
      <span class="token-keyword">throw new</span> <span class="token-class">Error</span>(<span class="token-string">`HTTP Error: ${response.status}`</span>);
    }

    <span class="token-keyword">return await</span> <span class="token-function">response</span>.<span class="token-function">json</span>();

} <span class="token-keyword">catch</span> (<span class="token-string">error</span>) {
<span class="token-keyword">if</span> (<span class="token-string">retries</span> &gt; <span class="token-keyword">0</span>) {
<span class="token-keyword">return</span> <span class="token-function">fetchData</span>(<span class="token-string">url</span>, { ...<span class="token-string">options</span>, <span class="token-string">retries</span>: <span class="token-string">retries</span> - <span class="token-keyword">1</span> });
}
<span class="token-keyword">throw</span> <span class="token-string">error</span>;
}
}

</pre>
</div>
</div>
<!-- Action Bar: AI Helper -->
<div class="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
<span class="material-icons">psychology</span>
</div>
<div>
<h3 class="text-sm font-semibold text-indigo-300">Ollama Insight</h3>
<p class="text-xs text-indigo-400/70">Ask local AI to refactor or explain this code.</p>
</div>
</div>
<div class="flex gap-2">
<button class="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors">Refactor</button>
<button class="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors">Generate Tests</button>
</div>
</div>
</div>
<!-- Right Column: Related / Metadata -->
<aside class="lg:w-1/3 xl:w-1/4 space-y-8">
<!-- Author Info Card -->
<div class="bg-white dark:bg-surface-dark rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
<div class="flex items-center gap-3 mb-4">
<img class="w-10 h-10 rounded-full object-cover border border-slate-700" data-alt="Profile picture of user Alex Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1wiqXsNyHJEMR8OVNwc4v3D4yEQOFvXB3KhEHh7e6_Ry9D4mAXBRNy-Cx0c6bTDeBP_e0JYz5kn3oddRai4y-mZxjwD-XpVnGd85HK8svG9x5O4VNdKkgkRNQ6aIroHsW3J5JKVDc98Fvhmx1oPd-Hsp5VNKG_9KFrXNUK6lfiJ4KJvqPZF4aMdrFg3PZZ9wDqmrOJ8kUaQDP99lTApCrnqtZvdkWzG178xUcJBD5XooCYLN0tkwQFzU8sm3SC8UkqGx6cQkgLZrb"/>
<div>
<p class="text-sm font-bold text-slate-900 dark:text-white">Alex Chen</p>
<p class="text-xs text-slate-500">Senior Frontend Dev</p>
</div>
</div>
<div class="grid grid-cols-2 gap-2 text-xs text-slate-400">
<div class="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
<span class="block text-slate-500 mb-1">Created</span>
<span class="font-mono text-slate-300">Oct 24, 2023</span>
</div>
<div class="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
<span class="block text-slate-500 mb-1">Size</span>
<span class="font-mono text-slate-300">1.2 KB</span>
</div>
</div>
</div>
<!-- Related Snippets (Semantic Search) -->
<div class="space-y-4">
<div class="flex items-center justify-between">
<h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Related Code</h3>
<span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Vector Search</span>
</div>
<!-- Card 1 -->
<a class="block group" href="#">
<div class="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm group-hover:shadow-md group-hover:shadow-primary/5 relative overflow-hidden">
<div class="absolute top-0 right-0 p-2 opacity-50">
<div class="radial-progress text-primary text-[10px] font-bold" style="--value:92;">92%</div>
</div>
<h4 class="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1 group-hover:text-primary transition-colors">Error Handler Middleware</h4>
<p class="text-xs text-slate-500 mb-3 line-clamp-2">Express.js middleware to standardize error responses across the API.</p>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-blue-500"></span>
<span class="text-xs text-slate-400 font-mono">TypeScript</span>
</div>
</div>
</a>
<!-- Card 2 -->
<a class="block group" href="#">
<div class="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm group-hover:shadow-md group-hover:shadow-primary/5">
<h4 class="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1 group-hover:text-primary transition-colors">Axios Interceptor Setup</h4>
<p class="text-xs text-slate-500 mb-3 line-clamp-2">Global configuration for Axios including token injection and logging.</p>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-yellow-500"></span>
<span class="text-xs text-slate-400 font-mono">JavaScript</span>
</div>
</div>
</a>
<!-- Card 3 -->
<a class="block group" href="#">
<div class="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm group-hover:shadow-md group-hover:shadow-primary/5">
<h4 class="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1 group-hover:text-primary transition-colors">React Query Hook</h4>
<p class="text-xs text-slate-500 mb-3 line-clamp-2">Custom hook wrapping React Query for consistent data loading states.</p>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-cyan-500"></span>
<span class="text-xs text-slate-400 font-mono">React</span>
</div>
</div>
</a>
</div>
<!-- Tags -->
<div class="space-y-3">
<h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tags</h3>
<div class="flex flex-wrap gap-2">
<span class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary cursor-pointer transition-colors">#api</span>
<span class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary cursor-pointer transition-colors">#promise</span>
<span class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary cursor-pointer transition-colors">#async-await</span>
<span class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary cursor-pointer transition-colors">#frontend</span>
</div>
</div>
</aside>
</main>
</body></html>

<!-- Onboarding & Setup -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Snippet AI Setup</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["Fira Code", "monospace"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Fira+Code:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'Fira Code', monospace; }
        /* Custom scrollbar for terminal logs */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen flex flex-col font-display antialiased selection:bg-primary/30">
<!-- Top Navigation Bar (Minimal) -->
<header class="w-full border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
<div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
<span class="material-icons text-lg">code</span>
</div>
<span class="font-semibold text-sm tracking-wide uppercase dark:text-white">Snippet AI</span>
</div>
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
<span class="text-xs font-mono text-slate-500 dark:text-slate-400">v1.0.4-beta</span>
</div>
</div>
</header>
<!-- Main Content Area -->
<main class="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto">
<!-- Onboarding Container -->
<div class="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
<!-- Left Sidebar: Progress Stepper -->
<div class="md:col-span-4 lg:col-span-3 sticky top-24">
<nav aria-label="Progress">
<ol class="overflow-hidden" role="list">
<li class="relative pb-10">
<div aria-hidden="true" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-primary"></div>
<a aria-current="step" class="relative flex items-start group" href="#">
<span class="h-9 flex items-center">
<span class="relative z-10 w-8 h-8 flex items-center justify-center bg-primary rounded-full group-hover:bg-primary/90 transition">
<span class="material-icons text-white text-sm">check</span>
</span>
</span>
<span class="ml-4 min-w-0 flex flex-col">
<span class="text-xs font-semibold tracking-wide uppercase text-primary">Prerequisites</span>
<span class="text-sm text-slate-500 dark:text-slate-400">Ollama Check</span>
</span>
</a>
</li>
<li class="relative pb-10">
<div aria-hidden="true" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700"></div>
<a aria-current="step" class="relative flex items-start group" href="#">
<span class="h-9 flex items-center">
<span class="relative z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-background-dark border-2 border-primary rounded-full">
<span class="h-2.5 w-2.5 bg-primary rounded-full"></span>
</span>
</span>
<span class="ml-4 min-w-0 flex flex-col">
<span class="text-xs font-semibold tracking-wide uppercase text-slate-900 dark:text-white">Model Setup</span>
<span class="text-sm text-slate-500 dark:text-slate-400">Downloading Embeddings</span>
</span>
</a>
</li>
<li class="relative pb-10">
<div aria-hidden="true" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700"></div>
<a class="relative flex items-start group" href="#">
<span class="h-9 flex items-center">
<span class="relative z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-background-dark border-2 border-slate-300 dark:border-slate-600 rounded-full group-hover:border-slate-400 transition">
<span class="text-xs font-mono text-slate-500">03</span>
</span>
</span>
<span class="ml-4 min-w-0 flex flex-col">
<span class="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">Storage</span>
<span class="text-sm text-slate-500 dark:text-slate-500">Local DB Path</span>
</span>
</a>
</li>
<li class="relative">
<a class="relative flex items-start group" href="#">
<span class="h-9 flex items-center">
<span class="relative z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-background-dark border-2 border-slate-300 dark:border-slate-600 rounded-full group-hover:border-slate-400 transition">
<span class="text-xs font-mono text-slate-500">04</span>
</span>
</span>
<span class="ml-4 min-w-0 flex flex-col">
<span class="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">Finish</span>
<span class="text-sm text-slate-500 dark:text-slate-500">Ready to Index</span>
</span>
</a>
</li>
</ol>
</nav>
</div>
<!-- Right Content: Active Step -->
<div class="md:col-span-8 lg:col-span-9">
<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
<!-- Header of the Card -->
<div class="px-8 py-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
<h1 class="text-2xl font-bold text-slate-900 dark:text-white">Download Embedding Model</h1>
<p class="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            To enable semantic search on your snippets locally, we need to download a lightweight embedding model. This runs entirely on your machine via Ollama.
                        </p>
</div>
<!-- Main Body -->
<div class="p-8 space-y-8">
<!-- Dependency Status (Completed) -->
<div class="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
<div class="flex items-center gap-3">
<div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
<span class="material-icons text-sm">check</span>
</div>
<div>
<p class="text-sm font-medium text-green-700 dark:text-green-400">Ollama Connection Established</p>
<p class="text-xs text-green-600/70 dark:text-green-500/60 font-mono">http://localhost:11434 (v0.1.28)</p>
</div>
</div>
<span class="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-200 dark:bg-green-900/40 px-2 py-1 rounded">CONNECTED</span>
</div>
<!-- Model Selection -->
<div class="space-y-3">
<label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Selected Model</label>
<div class="relative">
<select class="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 sm:text-sm py-2.5 pl-3 pr-10 focus:border-primary focus:ring-primary font-mono cursor-not-allowed" disabled="">
<option selected="">nomic-embed-text:latest (Recommended)</option>
<option>all-minilm:latest</option>
<option>mxbai-embed-large</option>
</select>
<span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
<span class="material-icons text-lg">lock</span>
</span>
</div>
<p class="text-xs text-slate-500 dark:text-slate-500">Defaulting to <span class="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded">nomic-embed-text</span> for optimal performance/size ratio.</p>
</div>
<!-- Download Progress -->
<div class="space-y-4">
<div class="flex items-end justify-between text-sm">
<span class="font-medium dark:text-white">Downloading model layers...</span>
<span class="font-mono text-primary">342MB / 580MB (58%)</span>
</div>
<div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
<div class="bg-primary h-2.5 rounded-full relative" style="width: 58%">
<div class="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
</div>
</div>
<div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-500 font-mono">
<span>ETA: ~12s</span>
<span>Speed: 24.5 MB/s</span>
</div>
</div>
<!-- Terminal Output -->
<div class="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-[#0d1117]">
<div class="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-800/50 border-b border-slate-700 dark:border-slate-800">
<div class="flex items-center gap-2">
<span class="material-icons text-slate-400 text-xs">terminal</span>
<span class="text-xs font-medium text-slate-300">Install Log</span>
</div>
<button class="text-xs text-primary hover:text-primary/80">Copy</button>
</div>
<div class="p-4 font-mono text-xs h-32 overflow-y-auto scrollbar-hide text-slate-300 leading-relaxed">
<p class="text-green-400/80">&gt; pulling manifest</p>
<p class="text-green-400/80">&gt; pulling 970aa74c0a90... 100%</p>
<p class="text-green-400/80">&gt; pulling c71d239df917... 100%</p>
<p class="text-yellow-400/80">&gt; pulling ce35fe969469... 58%</p>
<p class="opacity-50">verifying sha256 digest...</p>
<p class="opacity-50">writing manifest...</p>
</div>
</div>
</div>
<!-- Footer Actions -->
<div class="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
<button class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Back
                        </button>
<div class="flex gap-3">
<button class="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                Skip Setup
                            </button>
<!-- Disabled State for Next Button while downloading -->
<button class="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium bg-primary/50 text-white/50 cursor-wait pointer-events-none shadow-sm transition-all">
<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
<path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
</svg>
                                Downloading...
                            </button>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Support Footer -->
<footer class="w-full py-6 text-center">
<p class="text-xs text-slate-400 dark:text-slate-600">
            Need help? <a class="text-primary hover:underline" href="#">Check Documentation</a> or <a class="text-primary hover:underline" href="#">Open an Issue</a>.
        </p>
</footer>
</body></html>

<!-- Create/Edit Snippet -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Create/Edit Snippet - DevSnippet Manager</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind Config -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "mono": ["JetBrains Mono", "monospace"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for dark mode */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(19, 127, 236, 0.05); 
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(19, 127, 236, 0.2); 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(19, 127, 236, 0.4); 
        }
        
        /* Syntax highlighting simulation */
        .token.keyword { color: #ff79c6; }
        .token.function { color: #8be9fd; }
        .token.string { color: #f1fa8c; }
        .token.comment { color: #6272a4; }
        .token.class-name { color: #50fa7b; }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased h-screen flex flex-col overflow-hidden">
<!-- Header / Navbar -->
<header class="h-16 border-b border-primary/10 dark:border-primary/20 bg-white dark:bg-background-dark/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-20">
<div class="flex items-center gap-4">
<button class="p-2 rounded hover:bg-primary/10 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
<span class="material-icons">arrow_back</span>
</button>
<div class="flex flex-col">
<div class="text-xs text-primary font-medium tracking-wide uppercase">New Snippet</div>
<div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
<span>Library</span>
<span class="material-icons text-[10px]">chevron_right</span>
<span>Javascript</span>
</div>
</div>
</div>
<div class="flex items-center gap-3">
<div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs text-slate-500 dark:text-slate-400">
<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Ollama: Llama 3 (Local)
            </div>
<button class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-primary/10 transition-colors">
                Preview (⌘P)
            </button>
<button class="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02]">
<span class="material-icons text-sm">save</span>
                Save Snippet
            </button>
</div>
</header>
<!-- Main Content Area: Split View -->
<main class="flex-1 flex overflow-hidden">
<!-- Left Pane: Editor -->
<section class="flex-1 flex flex-col min-w-[320px] border-r border-primary/10 dark:border-primary/20 bg-white dark:bg-background-dark relative">
<!-- Editor Toolbar -->
<div class="p-6 pb-2 shrink-0 space-y-4">
<input class="w-full bg-transparent border-none text-2xl font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:ring-0 px-0 text-slate-900 dark:text-white" placeholder="Snippet Title..." type="text" value="Center a Div using Flexbox"/>
<div class="flex items-center gap-2 flex-wrap">
<span class="material-icons text-slate-400 text-sm">label</span>
<div class="flex items-center gap-2">
<span class="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20 flex items-center gap-1 group cursor-pointer hover:bg-primary/20">
                            css
                            <span class="material-icons text-[10px] opacity-0 group-hover:opacity-100">close</span>
</span>
<span class="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20 flex items-center gap-1 group cursor-pointer hover:bg-primary/20">
                            layout
                            <span class="material-icons text-[10px] opacity-0 group-hover:opacity-100">close</span>
</span>
<input class="bg-transparent border-none text-xs focus:ring-0 p-1 text-slate-500 w-24" placeholder="+ Add tag" type="text"/>
</div>
</div>
</div>
<div class="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
<!-- Problem Section (Prompt) -->
<div class="space-y-2 group">
<div class="flex items-center justify-between">
<label class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Problem Description</label>
<button class="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary hover:underline">Clear</button>
</div>
<div class="relative">
<textarea class="w-full rounded-lg bg-background-light dark:bg-[#151e29] border border-primary/10 dark:border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary p-4 text-sm resize-none transition-shadow" placeholder="Describe what you are trying to solve..." rows="3"></textarea>
<!-- AI Action Button Floating -->
<div class="absolute bottom-3 right-3">
<button class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-primary text-white text-xs font-medium shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5 group/btn">
<span class="material-icons text-sm animate-pulse">auto_awesome</span>
<span>AI Draft</span>
<span class="hidden group-hover/btn:inline opacity-70 ml-1 text-[10px] border border-white/30 px-1 rounded">⌘+J</span>
</button>
</div>
</div>
</div>
<!-- Solution Section (Editor) -->
<div class="space-y-2 h-full flex flex-col">
<div class="flex items-center justify-between">
<label class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Solution &amp; Code</label>
<div class="flex items-center gap-1 bg-background-light dark:bg-[#151e29] rounded p-1 border border-primary/10">
<button class="p-1 rounded hover:bg-primary/10 text-slate-400 hover:text-primary"><span class="material-icons text-sm">code</span></button>
<button class="p-1 rounded hover:bg-primary/10 text-slate-400 hover:text-primary"><span class="material-icons text-sm">format_bold</span></button>
<button class="p-1 rounded hover:bg-primary/10 text-slate-400 hover:text-primary"><span class="material-icons text-sm">link</span></button>
<div class="w-px h-3 bg-slate-700 mx-1"></div>
<span class="text-[10px] text-slate-500 px-1">Markdown</span>
</div>
</div>
<!-- Code Editor Mockup -->
<div class="flex-1 rounded-lg overflow-hidden border border-primary/10 dark:border-primary/20 bg-background-light dark:bg-[#151e29] font-mono text-sm leading-relaxed relative flex flex-col">
<!-- Line Numbers & Gutter -->
<div class="flex flex-1">
<div class="w-10 bg-slate-200 dark:bg-[#0d141c] text-slate-400 dark:text-slate-600 text-right pr-3 pt-4 select-none text-xs leading-6 border-r border-primary/5">
                                1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9
                            </div>
<textarea class="flex-1 bg-transparent border-none focus:ring-0 p-4 font-mono text-slate-800 dark:text-slate-300 resize-none h-full focus:bg-primary/5 transition-colors" spellcheck="false">To center a div both vertically and horizontally, the most modern approach is using Flexbox.</textarea></div></div></div></div></section></main></body></html>

<!-- Settings & AI Config -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Settings &amp; AI Config - Snippet Manager</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-dark": "#18232e",
                        "surface-darker": "#0d131a",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #101922; 
        }
        ::-webkit-scrollbar-thumb {
            background: #2d3748; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #4a5568; 
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col">
<!-- Top Navigation -->
<header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex items-center justify-between px-6 shrink-0 z-20">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
<span class="material-icons-round text-xl">code</span>
</div>
<h1 class="text-lg font-semibold tracking-tight">SnippetFlow</h1>
</div>
<div class="flex items-center gap-4">
<button class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-sm text-slate-500 dark:text-slate-400">
<span class="material-icons-round text-base">help_outline</span>
<span>Docs</span>
</button>
<div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-medium text-xs border-2 border-white dark:border-surface-dark shadow-sm">
                JD
            </div>
</div>
</header>
<div class="flex flex-1 overflow-hidden">
<!-- Sidebar Navigation -->
<aside class="w-64 bg-slate-50 dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
<nav class="flex-1 p-4 space-y-1">
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" href="#">
<span class="material-icons-round text-[20px]">tune</span>
<span class="text-sm font-medium">General</span>
</a>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary dark:text-blue-400" href="#">
<span class="material-icons-round text-[20px]">smart_toy</span>
<span class="text-sm font-medium">AI &amp; Models</span>
</a>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" href="#">
<span class="material-icons-round text-[20px]">folder_open</span>
<span class="text-sm font-medium">Data Storage</span>
</a>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" href="#">
<span class="material-icons-round text-[20px]">palette</span>
<span class="text-sm font-medium">Appearance</span>
</a>
<a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" href="#">
<span class="material-icons-round text-[20px]">extension</span>
<span class="text-sm font-medium">Plugins</span>
</a>
</nav>
<div class="p-4 border-t border-slate-200 dark:border-slate-800">
<div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 mb-2">
<span>Version 2.4.0</span>
<span class="text-emerald-500 flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Up to date
                    </span>
</div>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto p-8 relative">
<div class="max-w-3xl mx-auto space-y-8 pb-24">
<!-- Header -->
<div>
<h2 class="text-2xl font-bold text-slate-900 dark:text-white">AI Configuration</h2>
<p class="text-slate-500 dark:text-slate-400 mt-1">Manage local LLM connections, model selection, and vector embedding settings.</p>
</div>
<!-- Ollama Connection Status Card -->
<div class="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm relative overflow-hidden group">
<!-- Decorative background gradient -->
<div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
<div class="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
<div class="space-y-4 flex-1">
<div class="flex items-center gap-3">
<div class="bg-white dark:bg-surface-darker p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
<img alt="Ollama Logo" class="w-6 h-6 object-contain opacity-80 dark:invert" data-alt="Ollama logo icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLOQhosE2gqDllM1O6UOIsxUbLh8eOCBuIv593dtfB4unw6uBCAo1Ef8sYdoMsgttEDTXPCD6zC6dXbAXbPEcY3NeK7oVIyxz1x9cO7Mw5OhE2LmSE7KLTaoj_YF5-TzYft5xTYRkkiHHK34FJM87GlZv9ZoCZcqGyZ91UUOkAIjEvwny4uypsg6aDwuH5qucmVohc2EhhxyG5BBKbFciM1pW8YdwS2UWoAwuUT7ZHdXBypnQFYIzzon_GGvr2vUE0ez1cuzPRjf7d"/>
</div>
<div>
<h3 class="font-semibold text-slate-900 dark:text-white">Local Inference Server</h3>
<div class="flex items-center gap-2 mt-0.5">
<span class="relative flex h-2.5 w-2.5">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
</span>
<span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Connected to Ollama v0.1.32</span>
</div>
</div>
</div>
<div>
<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">API Endpoint</label>
<div class="flex shadow-sm rounded-lg">
<input class="block w-full rounded-l-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-surface-darker text-slate-900 dark:text-white sm:text-sm focus:ring-primary focus:border-primary font-mono px-3 py-2.5" type="text" value="http://localhost:11434"/>
<button class="inline-flex items-center px-4 py-2 border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-r-lg text-sm font-medium transition-colors">
<span class="material-icons-round text-sm mr-2">refresh</span>
                                        Test
                                    </button>
</div>
<p class="mt-1.5 text-xs text-slate-500">Default Ollama port is 11434. Ensure the service is running.</p>
</div>
</div>
<div class="flex items-center justify-center md:justify-end shrink-0">
<!-- Visual Graphic for connection -->
<div class="relative w-24 h-24 hidden md:block">
<div class="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-[spin_10s_linear_infinite]"></div>
<div class="absolute inset-4 rounded-full border border-primary/30"></div>
<div class="absolute inset-0 flex items-center justify-center text-primary">
<span class="material-icons-round text-4xl">dns</span>
</div>
</div>
</div>
</div>
</div>
<!-- Model Selection -->
<div class="space-y-6">
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<!-- Chat Model -->
<div class="space-y-3">
<label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Chat Model
                                <span class="ml-1 text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Used for generation</span>
</label>
<div class="relative">
<select class="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white sm:text-sm focus:ring-primary focus:border-primary py-2.5 pl-3 pr-10 shadow-sm appearance-none">
<option>llama3:8b (Latest)</option>
<option selected="">mistral:7b-instruct</option>
<option>gemma:7b</option>
<option>codellama:13b</option>
</select>
<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
<span class="material-icons-round text-lg">expand_more</span>
</div>
</div>
<div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
<span>Size: 4.1GB</span>
<span>Params: 7B</span>
</div>
</div>
<!-- Embedding Model -->
<div class="space-y-3">
<label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Embedding Model
                                <span class="ml-1 text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Used for semantic search</span>
</label>
<div class="relative">
<select class="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-900 dark:text-white sm:text-sm focus:ring-primary focus:border-primary py-2.5 pl-3 pr-10 shadow-sm appearance-none">
<option selected="">nomic-embed-text</option>
<option>mxbai-embed-large</option>
<option>all-minilm</option>
</select>
<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
<span class="material-icons-round text-lg">expand_more</span>
</div>
</div>
<!-- Download Progress Indicator -->
<div class="bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 rounded-lg p-3">
<div class="flex justify-between items-center mb-1">
<span class="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
<span class="material-icons-round text-sm animate-spin">sync</span>
                                        Downloading nomic-embed-text...
                                    </span>
<span class="text-xs font-bold text-primary">45%</span>
</div>
<div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
<div class="bg-primary h-1.5 rounded-full" style="width: 45%"></div>
</div>
<div class="flex justify-end mt-1">
<span class="text-[10px] text-slate-400">2.4 MB/s • 12s remaining</span>
</div>
</div>
</div>
</div>
</div>
<hr class="border-slate-200 dark:border-slate-800/60 my-8"/>
<!-- Storage Path Picker -->
<div class="space-y-4">
<h3 class="text-lg font-medium text-slate-900 dark:text-white">Data Storage</h3>
<div class="bg-slate-50 dark:bg-surface-dark/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Local Vault Path</label>
<div class="flex gap-2">
<div class="relative flex-grow">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-icons-round text-slate-400 text-lg">folder</span>
</div>
<input class="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark pl-10 text-slate-600 dark:text-slate-300 sm:text-sm focus:ring-primary focus:border-primary font-mono py-2.5 shadow-sm" readonly="" type="text" value="/Users/dev/Documents/SnippetVault"/>
</div>
<button class="bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm whitespace-nowrap">
                                Browse...
                            </button>
</div>
<p class="mt-2 text-xs text-slate-500">All your snippets and vector embeddings are stored locally in this folder.</p>
</div>
</div>
<hr class="border-slate-200 dark:border-slate-800/60 my-8"/>
<!-- Appearance -->
<div class="space-y-4">
<h3 class="text-lg font-medium text-slate-900 dark:text-white">Appearance</h3>
<div class="flex flex-col sm:flex-row gap-4">
<!-- Theme Toggle Component -->
<div class="flex-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Interface Theme</span>
<div class="flex bg-slate-100 dark:bg-surface-darker rounded-lg p-1">
<button class="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
<span class="material-icons-round text-sm">light_mode</span>
</button>
<button class="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
<span class="material-icons-round text-sm">settings_system_daydream</span>
</button>
<button class="p-1.5 bg-white dark:bg-slate-700 shadow-sm rounded-md text-primary dark:text-white transition-all">
<span class="material-icons-round text-sm">dark_mode</span>
</button>
</div>
</div>
<!-- Code Block Style -->
<div class="flex-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Syntax Highlight</span>
<select class="rounded-md border-none bg-slate-100 dark:bg-surface-darker text-xs font-medium text-slate-700 dark:text-slate-300 py-1.5 pl-3 pr-8 focus:ring-0 cursor-pointer">
<option>Dracula</option>
<option>GitHub Dark</option>
<option>Monokai</option>
</select>
</div>
</div>
</div>
</div>
<!-- Sticky Action Footer -->
<div class="fixed bottom-0 left-64 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent z-10 pointer-events-none flex justify-end">
<div class="pointer-events-auto flex items-center gap-3">
<button class="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                        Discard Changes
                    </button>
<button class="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all text-sm font-medium flex items-center gap-2">
<span class="material-icons-round text-sm">save</span>
                        Save Configuration
                    </button>
</div>
</div>
</main>
</div>
</body></html>
