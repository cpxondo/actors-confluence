import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Users, Film, Tv, LayoutGrid, ChevronRight, Loader2, ExternalLink } from 'lucide-react';

const TMDB_API_KEY = '';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedActors, setSelectedActors] = useState([]);

    const [matches, setMatches] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);
    const [error, setError] = useState(null);

    const [apiKey, setApiKey] = useState(TMDB_API_KEY);
    const [showSettings, setShowSettings] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [filterType, setFilterType] = useState('all'); // 'all', 'movie', 'tv'

    const searchTimeoutRef = useRef(null);

    const searchActors = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setApiError(null);
        try {
            const response = await fetch(
                `${BASE_URL}/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`
            );

            if (!response.ok) {
                if (response.status === 401) throw new Error("Invalid API Key. Change it in settings.");
                if (response.status === 429) throw new Error("Rate limit reached. Wait a moment or enter your own key.");
                throw new Error("Connection error with TMDB");
            }

            const data = await response.json();
            const actorsOnly = data.results.filter(person => person.known_for_department === 'Acting');
            setSearchResults(actorsOnly);
        } catch (err) {
            console.error("Error searching actors:", err);
            setApiError(err.message);
        } finally {
            setIsSearching(false);
        }
    }, [apiKey]);

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => searchActors(searchQuery), 400);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery, searchActors]);

    const addActor = (actor) => {
        if (!selectedActors.find(a => a.id === actor.id)) {
            setSelectedActors([...selectedActors, actor]);
        }
        setSearchQuery('');
        setSearchResults([]);
        setHasCalculated(false);
    };

    const removeActor = (actorId) => {
        setSelectedActors(selectedActors.filter(a => a.id !== actorId));
        setHasCalculated(false);
    };

    const findMatches = async () => {
        if (selectedActors.length < 2) return;

        setIsCalculating(true);
        setError(null);
        setMatches([]);
        setHasCalculated(true);

        try {
            const creditsPromises = selectedActors.map(async (actor) => {
                const response = await fetch(
                    `${BASE_URL}/person/${actor.id}/combined_credits?api_key=${apiKey}&language=en-US`
                );
                if (!response.ok) {
                    if (response.status === 401) throw new Error("Invalid API Key. Change it in settings.");
                    if (response.status === 429) throw new Error("Rate limit reached. Wait a few minutes.");
                    throw new Error("Error fetching API data");
                }
                const data = await response.json();
                return data.cast;
            });

            const allCredits = await Promise.all(creditsPromises);

            let commonWorks = allCredits[0].filter(work0 => {
                return allCredits.every(actorCredits =>
                    actorCredits.some(workN => workN.id === work0.id && workN.media_type === work0.media_type)
                );
            });

            const uniqueMatches = Array.from(new Map(commonWorks.map(item => [item.id, item])).values());
            uniqueMatches.sort((a, b) => b.popularity - a.popularity);

            setMatches(uniqueMatches);

        } catch (err) {
            setError(err.message || "Could not load data.");
        } finally {
            setIsCalculating(false);
        }
    };

    const filteredMatches = filterType === 'all'
        ? matches
        : matches.filter(match => match.media_type === filterType);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans sm:pb-8">
            <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-20">
                <div className="max-w-2xl mx-auto flex items-center gap-2">
                    <Users className="text-blue-500" size={28} />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Actor Matches
                    </h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4 flex flex-col gap-6">

                {/* API Settings */}
                <section className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            TMDB API Key Configuration
                        </label>
                        <button onClick={() => setShowSettings(!showSettings)} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-gray-900 rounded-md">
                            {showSettings ? 'Hide' : 'Modify key'}
                        </button>
                    </div>
                    {showSettings && (
                        <div className="mt-3 text-sm text-gray-400">
                            <p className="mb-2">Enter your API Key (v3 auth) from <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">TheMovieDB</a>:</p>
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API Key here..."
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    )}
                    {apiError && (
                        <div className="mt-3 p-3 bg-red-900/30 border border-red-800 rounded-xl text-red-300 text-sm">
                            ⚠️ {apiError}
                        </div>
                    )}
                </section>

                {/* Search Section */}
                <section className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700 relative">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Search and add actors/actresses
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ex: Brad Pitt..."
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {isSearching && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <Loader2 size={18} className="text-blue-500 animate-spin" />
                            </div>
                        )}
                    </div>

                    {searchResults.length > 0 && searchQuery && (
                        <ul className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-gray-700 left-0 right-0">
                            {searchResults.map((actor) => (
                                <li
                                    key={actor.id}
                                    onClick={() => addActor(actor)}
                                    className="p-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden shrink-0">
                                        {actor.profile_path ? (
                                            <img src={`${IMAGE_BASE_URL}${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover"/>
                                        ) : (
                                            <Users size={20} className="m-auto mt-2.5 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{actor.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {actor.known_for?.map(k => k.title || k.name).slice(0,2).join(', ')}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Selected Actors */}
                <section>
                    <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <Users size={16} /> Actors to compare ({selectedActors.length})
                    </h2>

                    {selectedActors.length === 0 ? (
                        <div className="bg-gray-800/50 border border-gray-700 border-dashed rounded-xl p-6 text-center text-gray-500">
                            Search and add at least 2 actors to start
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {selectedActors.map(actor => (
                                <div key={actor.id} className="bg-gray-800 border border-gray-700 rounded-full py-1.5 pl-2 pr-1.5 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                        {actor.profile_path && (
                                            <img src={`${IMAGE_BASE_URL}${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover"/>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{actor.name}</span>
                                    <button onClick={() => removeActor(actor.id)} className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-red-400">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={findMatches}
                        disabled={selectedActors.length < 2 || isCalculating}
                        className={`mt-4 w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 ${selectedActors.length < 2 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                        {isCalculating ? <><Loader2 className="animate-spin" size={20} /> Searching...</> : <>Find Matches <ChevronRight size={20} /></>}
                    </button>
                </section>

                {/* Results */}
                {hasCalculated && !isCalculating && (
                    <section className="mt-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Results ({matches.length})</h2>
                            {matches.length > 0 && (
                                <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700 text-sm">
                                    <button onClick={() => setFilterType('all')} className={`p-1.5 px-3 rounded-md flex items-center gap-1.5 ${filterType === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><LayoutGrid size={14} /> All</button>
                                    <button onClick={() => setFilterType('movie')} className={`p-1.5 px-3 rounded-md flex items-center gap-1.5 ${filterType === 'movie' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><Film size={14} /> Movies</button>
                                    <button onClick={() => setFilterType('tv')} className={`p-1.5 px-3 rounded-md flex items-center gap-1.5 ${filterType === 'tv' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><Tv size={14} /> TV</button>
                                </div>
                            )}
                        </div>

                        {error && <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-xl text-center">{error}</div>}

                        {!error && matches.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-700">
                                <LayoutGrid className="mx-auto mb-3 opacity-50" size={32} />
                                <p>No matching projects found.</p>
                            </div>
                        ) : !error && filteredMatches.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-700">
                                <p>No results found for this filter.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredMatches.map(match => (
                                    <div key={match.id} className="bg-gray-800 rounded-xl overflow-hidden flex shadow-lg border border-gray-700/50">
                                        <div className="w-24 shrink-0 bg-gray-900">
                                            {match.poster_path ? (
                                                <img src={`https://image.tmdb.org/t/p/w154${match.poster_path}`} alt={match.title || match.name} className="w-full h-full object-cover"/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                    {match.media_type === 'tv' ? <Tv size={24} /> : <Film size={24} />}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 flex flex-col flex-1 justify-center relative">
                                            <div className="absolute top-2 right-2 bg-gray-900/80 p-1.5 rounded text-gray-400">
                                                {match.media_type === 'tv' ? <Tv size={14} /> : <Film size={14} />}
                                            </div>
                                            <h3 className="font-bold text-white text-base leading-tight pr-6">{match.title || match.name}</h3>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {match.release_date || match.first_air_date ? new Date(match.release_date || match.first_air_date).getFullYear() : 'Unknown year'}
                                            </p>
                                            <a href={`https://www.themoviedb.org/${match.media_type}/${match.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-400 hover:text-blue-300 font-medium">
                                                View on TMDB <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
