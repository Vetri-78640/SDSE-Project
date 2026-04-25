"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialProfile = {
  name: "",
  gender: "male",
  dateOfBirth: "",
  timeOfBirth: "",
  city: "",
  state: "",
  country: "",
  latitude: "",
  longitude: "",
  timezone: "+5.5",
};

const initialAuth = {
  name: "",
  email: "",
  password: "",
};

const initialChart = {
  chartName: "",
  chartType: "horoscope-chart-svg-code",
};

const initialDosha = {
  doshaType: "manglik",
};

export default function Home() {
  const [token, setToken] = useState("");
  const [auth, setAuth] = useState(initialAuth);
  const [profile, setProfile] = useState(initialProfile);
  const [chart, setChart] = useState(initialChart);
  const [dosha, setDosha] = useState(initialDosha);
  const [doshaTypes, setDoshaTypes] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [charts, setCharts] = useState([]);
  const [lastChart, setLastChart] = useState(null);
  const [lastDosha, setLastDosha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("astrology_token");
    if (saved) setToken(saved);

    api
      .getDoshaTypes()
      .then((res) => {
        const list = res?.data || [];
        setDoshaTypes(list);
        if (list.length > 0) {
          setDosha((prev) => ({ ...prev, doshaType: list[0] }));
        }
      })
      .catch(() => {});
  }, []);

  const chartTypes = useMemo(
    () => [
      "horoscope-chart-svg-code",
      "navamsa-chart-svg-code",
      "d2-chart-svg-code",
      "d3-chart-svg-code",
      "d4-chart-svg-code",
      "d5-chart-svg-code",
      "d6-chart-svg-code",
      "d7-chart-svg-code",
      "d8-chart-svg-code",
      "d10-chart-svg-code",
      "d11-chart-svg-code",
      "d12-chart-svg-code",
      "d16-chart-svg-code",
      "d20-chart-svg-code",
      "d24-chart-svg-code",
      "d27-chart-svg-code",
      "d30-chart-svg-code",
      "d40-chart-svg-code",
      "d45-chart-svg-code",
      "d60-chart-svg-code",
      "horoscope-chart-url",
      "navamsa-chart-url",
      "d2-chart-url",
      "d3-chart-url",
      "d4-chart-url",
      "d5-chart-url",
      "d6-chart-url",
      "d7-chart-url",
      "d8-chart-url",
      "d10-chart-url",
      "d11-chart-url",
      "d12-chart-url",
      "d16-chart-url",
      "d20-chart-url",
      "d24-chart-url",
      "d27-chart-url",
      "d30-chart-url",
      "d40-chart-url",
      "d45-chart-url",
      "d60-chart-url",
    ],
    []
  );

  const run = async (fn) => {
    setLoading(true);
    setMessage("");
    try {
      await fn();
    } catch (error) {
      setMessage(error.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = () =>
    run(async () => {
      const res = await api.signup(auth);
      const nextToken = res?.data?.token || "";
      setToken(nextToken);
      localStorage.setItem("astrology_token", nextToken);
      setMessage("Signup successful");
    });

  const onSignin = () =>
    run(async () => {
      const res = await api.signin({ email: auth.email, password: auth.password });
      const nextToken = res?.data?.token || "";
      setToken(nextToken);
      localStorage.setItem("astrology_token", nextToken);
      setMessage("Signin successful");
    });

  const onCreateProfile = () =>
    run(async () => {
      const payload = {
        ...profile,
        latitude: Number(profile.latitude),
        longitude: Number(profile.longitude),
      };
      const res = await api.createProfile(payload, token);
      setProfileData(res?.data || null);
      setMessage("Profile created");
    });

  const onGetProfile = () =>
    run(async () => {
      const res = await api.getProfile(token);
      setProfileData(res?.data || null);
      setMessage("Profile fetched");
    });

  const onGenerateChart = () =>
    run(async () => {
      const res = await api.generateChart(chart, token);
      const generated = res?.data || null;
      setLastChart(generated);
      setMessage("Chart generated");
      const chartsRes = await api.getCharts(token);
      setCharts(chartsRes?.data || []);
    });

  const onGetCharts = () =>
    run(async () => {
      const res = await api.getCharts(token);
      setCharts(res?.data || []);
      setMessage("Charts fetched");
    });

  const onCheckDosha = () =>
    run(async () => {
      const res = await api.checkDosha(dosha, token);
      setLastDosha(res?.data || null);
      setMessage("Dosha checked");
    });

  const onLogout = () => {
    localStorage.removeItem("astrology_token");
    setToken("");
    setMessage("Logged out");
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <section className="container mx-auto px-4 pb-10 pt-16">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-600">Deepa&apos;s Vision</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Vedic astrology frontend connected to your backend APIs
          </h1>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Template kept in place, backend workflows wired for auth, profile, chart generation, and dosha checks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
              API ready
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
              Token auth
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
              Chart endpoints
            </span>
          </div>
        </div>
      </section>

      <section id="workspace" className="container mx-auto grid gap-6 px-4 pb-16 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Signup or signin to get JWT token</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Name"
              value={auth.name}
              onChange={(e) => setAuth((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              placeholder="Email"
              value={auth.email}
              onChange={(e) => setAuth((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={auth.password}
              onChange={(e) => setAuth((p) => ({ ...p, password: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button onClick={onSignup} disabled={loading}>Signup</Button>
              <Button variant="outline" onClick={onSignin} disabled={loading}>Signin</Button>
              <Button variant="ghost" onClick={onLogout} disabled={loading}>Logout</Button>
            </div>
            <p className="text-xs break-all text-slate-600">Token: {token || "Not set"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Create and fetch birth profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Gender (male/female/other)" value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))} />
              <Input placeholder="Date of birth (YYYY-MM-DD)" value={profile.dateOfBirth} onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))} />
              <Input placeholder="Time of birth (HH:MM)" value={profile.timeOfBirth} onChange={(e) => setProfile((p) => ({ ...p, timeOfBirth: e.target.value }))} />
              <Input placeholder="City" value={profile.city} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
              <Input placeholder="State" value={profile.state} onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))} />
              <Input placeholder="Country" value={profile.country} onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))} />
              <Input placeholder="Timezone (e.g. +5.5)" value={profile.timezone} onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))} />
              <Input placeholder="Latitude" value={profile.latitude} onChange={(e) => setProfile((p) => ({ ...p, latitude: e.target.value }))} />
              <Input placeholder="Longitude" value={profile.longitude} onChange={(e) => setProfile((p) => ({ ...p, longitude: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={onCreateProfile} disabled={loading || !token}>Create profile</Button>
              <Button variant="outline" onClick={onGetProfile} disabled={loading || !token}>Get profile</Button>
            </div>
            <pre className="max-h-44 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card id="api">
          <CardHeader>
            <CardTitle>Chart generation</CardTitle>
            <CardDescription>All backend chart types supported</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Chart name"
              value={chart.chartName}
              onChange={(e) => setChart((p) => ({ ...p, chartName: e.target.value }))}
            />
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={chart.chartType}
              onChange={(e) => setChart((p) => ({ ...p, chartType: e.target.value }))}
            >
              {chartTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={onGenerateChart} disabled={loading || !token}>Generate chart</Button>
              <Button variant="outline" onClick={onGetCharts} disabled={loading || !token}>Get charts</Button>
            </div>
            <pre className="max-h-44 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
              {JSON.stringify(lastChart, null, 2)}
            </pre>
            <pre className="max-h-44 overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
              {JSON.stringify(charts, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card id="features">
          <CardHeader>
            <CardTitle>Dosha check</CardTitle>
            <CardDescription>Check dosha reports from backend API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={dosha.doshaType}
              onChange={(e) => setDosha({ doshaType: e.target.value })}
            >
              {(doshaTypes.length > 0 ? doshaTypes : ["manglik", "kalsarp", "sadesati", "pitradosh", "nadi"]).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Button onClick={onCheckDosha} disabled={loading || !token}>Check dosha</Button>
            <pre className="max-h-72 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
              {JSON.stringify(lastDosha, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Runtime feedback from API calls</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {loading ? "Running request..." : message || "Ready"}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
