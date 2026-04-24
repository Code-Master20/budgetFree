import { motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import SiteChrome from "../components/SiteChrome";

const SPEAK_UP_LANGUAGES = [
  { id: "en", label: "English", langCode: "en-IN" },
  { id: "hi", label: "हिंदी", langCode: "hi-IN" },
  { id: "bn", label: "বাংলা", langCode: "bn-IN" },
];

function pickVoiceForLanguage(voices, langCode) {
  return (
    voices.find((voice) => voice.lang === langCode) ??
    voices.find((voice) => voice.lang.startsWith(langCode.split("-")[0])) ??
    null
  );
}

function SpeakUpButtons({
  activeSpeechId,
  cardId,
  isSpeechSupported,
  onSpeak,
  speech,
  className = "",
  withDivider = true,
}) {
  return (
    <div
      className={`${
        withDivider ? "mt-4 border-t border-slate-200/70 pt-3" : ""
      } ${className}`.trim()}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Speak up
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SPEAK_UP_LANGUAGES.map((language) => {
          const buttonSpeechId = `${cardId}-${language.id}`;
          const isActive = activeSpeechId === buttonSpeechId;

          return (
            <button
              key={language.id}
              type="button"
              onClick={() => onSpeak(cardId, language.id, speech[language.id])}
              disabled={!isSpeechSupported}
              aria-pressed={isActive}
              aria-label={`Speak this card in ${language.label}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-slate-200 bg-white/90 text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {language.label}
            </button>
          );
        })}
      </div>
      {!isSpeechSupported ? (
        <p className="mt-2 text-xs text-slate-500">
          Audio playback is not supported in this browser.
        </p>
      ) : null}
    </div>
  );
}

function CompactSpeakUpMenu({
  activeSpeechId,
  cardId,
  isSpeechSupported,
  onSpeak,
  speech,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-10">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={!isSpeechSupported}
        aria-expanded={isOpen}
        aria-label="Open speak up options"
        className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Speak up
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full mt-2 w-max rounded-[20px] border border-slate-200/80 bg-white/95 p-3 shadow-[0_16px_34px_rgba(16,24,31,0.12)] backdrop-blur">
          <div className="flex flex-wrap justify-end gap-2">
            {SPEAK_UP_LANGUAGES.map((language) => {
              const buttonSpeechId = `${cardId}-${language.id}`;
              const isActive = activeSpeechId === buttonSpeechId;

              return (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => {
                    onSpeak(cardId, language.id, speech[language.id]);
                    setIsOpen(false);
                  }}
                  aria-pressed={isActive}
                  aria-label={`Speak this card in ${language.label}`}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
                  }`}
                >
                  {language.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const isSpeechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  useEffect(() => {
    if (!isSpeechSupported) {
      return undefined;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSpeechSupported]);

  const handleSpeak = (cardId, languageId, message) => {
    if (!isSpeechSupported) {
      return;
    }

    const speechId = `${cardId}-${languageId}`;
    const synthesizer = window.speechSynthesis;

    if (activeSpeechId === speechId) {
      synthesizer.cancel();
      setActiveSpeechId(null);
      return;
    }

    const selectedLanguage = SPEAK_UP_LANGUAGES.find(
      (language) => language.id === languageId,
    );
    const utterance = new window.SpeechSynthesisUtterance(message);

    utterance.lang = selectedLanguage?.langCode ?? "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const matchingVoice = pickVoiceForLanguage(
      synthesizer.getVoices(),
      utterance.lang,
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setActiveSpeechId((currentSpeechId) =>
        currentSpeechId === speechId ? null : currentSpeechId,
      );
    };

    utterance.onerror = () => {
      setActiveSpeechId((currentSpeechId) =>
        currentSpeechId === speechId ? null : currentSpeechId,
      );
    };

    synthesizer.cancel();
    setActiveSpeechId(speechId);
    synthesizer.speak(utterance);
  };

  const heroSpeech = {
    en: "Budget shopping rewards. BudgetFree is for shoppers who want affordable products, honest reviews, and a simple way to earn points from approved participation that turn into wallet balance and Amazon Pay gift cards.",
    hi: "बजट शॉपिंग रिवॉर्ड्स। BudgetFree उन खरीदारों के लिए है जो सस्ते और उपयोगी प्रोडक्ट, ईमानदार रिव्यू और approved participation के बाद points कमाने का आसान तरीका चाहते हैं, जिन्हें wallet balance और Amazon Pay gift cards में बदला जा सकता है।",
    bn: "বাজেট শপিং রিওয়ার্ডস। BudgetFree তাদের জন্য, যারা সাশ্রয়ী পণ্য, সত্যিকারের রিভিউ এবং approved participation-এর পর পয়েন্ট অর্জনের সহজ উপায় চান, যেগুলো wallet balance এবং Amazon Pay gift card-এ বদলানো যায়।",
  };

  const customerBenefits = [
    {
      label: "Affordable finds",
      value: "Compare",
      note: "Browse budget-friendly products and shortlist what gives you the best value for your money.",
      speech: {
        en: "Affordable finds. Compare. Browse budget-friendly products and shortlist what gives you the best value for your money.",
        hi: "सस्ते विकल्प। तुलना करें। अपने बजट के हिसाब से प्रोडक्ट देखें और जो आपके पैसों का सबसे अच्छा मूल्य दें उन्हें चुनें।",
        bn: "সাশ্রয়ী পছন্দ। তুলনা করুন। বাজেটের মধ্যে পণ্য দেখুন এবং যেগুলো আপনার টাকার সেরা মূল্য দেয় সেগুলো বেছে নিন।",
      },
    },
    {
      label: "Real feedback",
      value: "Review",
      note: "Read customer reviews and ratings before you open the final affiliate product link.",
      speech: {
        en: "Real feedback. Review. Read customer reviews and ratings before you open the final product link.",
        hi: "असल प्रतिक्रिया। रिव्यू। अंतिम प्रोडक्ट लिंक खोलने से पहले ग्राहकों के रिव्यू और रेटिंग पढ़ें।",
        bn: "আসল মতামত। রিভিউ। শেষ পণ্যের লিংক খোলার আগে ক্রেতাদের রিভিউ ও রেটিং পড়ুন।",
      },
    },
    {
      label: "Rewards",
      value: user ? "Earn" : "Unlock",
      note: "Create an account to collect points from approved reviews and turn them into wallet balance.",
      speech: {
        en: `Rewards. ${
          user ? "Earn" : "Unlock"
        }. Create an account to collect points from approved reviews and turn them into wallet balance.`,
        hi: `रिवॉर्ड्स। ${
          user ? "कमाएं" : "पाएं"
        }। approved reviews से पॉइंट्स इकट्ठा करने और उन्हें wallet balance में बदलने के लिए अकाउंट बनाएं।`,
        bn: `রিওয়ার্ডস। ${
          user ? "অর্জন করুন" : "পান"
        }। approved review থেকে পয়েন্ট জমা করতে এবং সেগুলো wallet balance-এ বদলাতে একটি অ্যাকাউন্ট খুলুন।`,
      },
    },
  ];

  const quickSteps = [
    "Search products that fit your budget and compare the best options.",
    "Open product pages to check price, rating, images, and review details.",
    "Sign up to submit reviews, earn points, and request Amazon Pay gift cards.",
  ];

  const reasonsToUseBudgetFree = [
    {
      title: "Budget-first product discovery",
      body: "BudgetFree helps shoppers find useful products without wasting time on overpriced or low-value listings.",
    },
    {
      title: "Buy, review, and earn points",
      body: "If you visit a relevant ecommerce website through a BudgetFree product link and buy that specific product, come back after the product is delivered and write a review on the same product page. Once your review is approved, you get reward points.",
    },
    {
      title: "Rewards for genuine participation",
      body: "When your reviews are approved, you earn points that can be converted into wallet balance and used for gift card requests.",
    },
    {
      title: "One place for shopping activity",
      body: "Your account keeps your searches, visited products, review status, wallet balance, and reward history together.",
    },
  ];

  const whyCustomersSpeech = {
    en: "Why customers use BudgetFree. Budget-first product discovery. BudgetFree helps shoppers find useful products without wasting time on overpriced or low-value listings. Buy, review, and earn points. If you visit a relevant ecommerce website through a BudgetFree product link and buy that specific product, come back after delivery and write a review on the same product page. Once your review is approved, you get reward points. Rewards for genuine participation. When your reviews are approved, you earn points that can be converted into wallet balance and used for gift card requests. One place for shopping activity. Your account keeps your searches, visited products, review status, wallet balance, and reward history together.",
    hi: "लोग BudgetFree क्यों इस्तेमाल करते हैं। बजट के हिसाब से प्रोडक्ट खोजें। BudgetFree खरीदारों को महंगे या कम वैल्यू वाले प्रोडक्ट्स पर समय बर्बाद किए बिना उपयोगी प्रोडक्ट खोजने में मदद करता है। खरीदें, रिव्यू लिखें और पॉइंट्स कमाएं। अगर आप BudgetFree के किसी प्रोडक्ट लिंक से किसी संबंधित ईकॉमर्स वेबसाइट पर जाते हैं और वही प्रोडक्ट खरीदते हैं, तो डिलीवरी मिलने के बाद उसी प्रोडक्ट पेज पर वापस आकर रिव्यू लिखें। आपका रिव्यू approve होने पर आपको reward points मिलते हैं। सही भागीदारी पर रिवॉर्ड्स। जब आपके रिव्यू approve हो जाते हैं, तो आपको पॉइंट्स मिलते हैं जिन्हें wallet balance में बदला जा सकता है और gift card requests के लिए इस्तेमाल किया जा सकता है। शॉपिंग गतिविधि के लिए एक ही जगह। आपका अकाउंट आपकी searches, देखे गए products, review status, wallet balance और reward history को एक साथ रखता है।",
    bn: "কেন গ্রাহকেরা BudgetFree ব্যবহার করেন। বাজেট অনুযায়ী পণ্য খুঁজুন। BudgetFree ক্রেতাদের অতিরিক্ত দামী বা কম মূল্যবান তালিকায় সময় নষ্ট না করে দরকারি পণ্য খুঁজে পেতে সাহায্য করে। কিনুন, রিভিউ দিন এবং পয়েন্ট অর্জন করুন। যদি আপনি BudgetFree-এর কোনো পণ্যের লিংক থেকে একটি প্রাসঙ্গিক ইকমার্স ওয়েবসাইটে যান এবং সেই নির্দিষ্ট পণ্যটি কেনেন, তবে ডেলিভারি পাওয়ার পরে একই পণ্যের পেজে ফিরে এসে রিভিউ লিখুন। আপনার রিভিউ approve হলে আপনি reward points পাবেন। সত্যিকারের অংশগ্রহণের জন্য রিওয়ার্ড। আপনার রিভিউ approve হলে আপনি পয়েন্ট পান, যা wallet balance-এ বদলানো যায় এবং gift card request-এর জন্য ব্যবহার করা যায়। সব শপিং কাজের জন্য এক জায়গা। আপনার অ্যাকাউন্টে search history, দেখা পণ্য, review status, wallet balance এবং reward history একসাথে রাখা থাকে।",
  };

  const howItWorksSpeech = {
    en: "How it works. Step 1. Search products that fit your budget and compare the best options. Step 2. Open product pages to check price, rating, images, and review details. Step 3. Sign up to submit reviews, earn points, and request Amazon Pay gift cards.",
    hi: "यह कैसे काम करता है। स्टेप 1। अपने बजट के हिसाब से प्रोडक्ट खोजें और सबसे अच्छे विकल्पों की तुलना करें। स्टेप 2। कीमत, रेटिंग, तस्वीरें और रिव्यू की जानकारी देखने के लिए प्रोडक्ट पेज खोलें। स्टेप 3। रिव्यू भेजने, पॉइंट्स कमाने और Amazon Pay gift cards के लिए request करने हेतु साइन अप करें।",
    bn: "এটি কীভাবে কাজ করে। ধাপ ১। আপনার বাজেট অনুযায়ী পণ্য খুঁজুন এবং সেরা বিকল্পগুলোর তুলনা করুন। ধাপ ২। দাম, রেটিং, ছবি এবং রিভিউর তথ্য দেখতে পণ্যের পেজ খুলুন। ধাপ ৩। রিভিউ জমা দিতে, পয়েন্ট অর্জন করতে এবং Amazon Pay gift card request করতে সাইন আপ করুন।",
  };

  return (
    <PageTransition className="page-wrap">
      <SiteChrome>
        <div className="app-shell space-y-8">
          <Motion.header
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-panel flex flex-col gap-5 rounded-[32px] px-5 py-5 sm:px-7"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <span className="eyebrow">Budget shopping rewards</span>
                <div>
                  <h1 className="text-3xl font-semibold sm:text-5xl">
                    Find better products without overspending.
                  </h1>
                  <p className="section-copy mt-4 max-w-2xl">
                    BudgetFree is for shoppers who want affordable products,
                    honest reviews, and a simple way to earn points from
                    approved participation that turn into wallet balance and
                    Amazon Pay gift cards. Partner-store purchases opened
                    through BudgetFree can also qualify for affiliate tracking
                    when completed within the store's valid attribution window.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 lg:min-w-[320px] lg:items-end">
                <CompactSpeakUpMenu
                  activeSpeechId={activeSpeechId}
                  cardId="hero-budget-shopping-rewards"
                  isSpeechSupported={isSpeechSupported}
                  onSpeak={handleSpeak}
                  speech={heroSpeech}
                />

                <div className="flex flex-wrap gap-3">
                  <Link className="primary-button" to="/products">
                    Explore products
                  </Link>
                  {user ? (
                    <Link className="secondary-button" to="/dashboard">
                      Open my dashboard
                    </Link>
                  ) : (
                    <Link className="secondary-button" to="/register">
                      Create free account
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {customerBenefits.map((stat) => (
                <Motion.div
                  key={stat.label}
                  className="glass-panel-strong rounded-[24px] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {stat.label}
                    </p>
                    <CompactSpeakUpMenu
                      activeSpeechId={activeSpeechId}
                      cardId={`benefit-${stat.label}`}
                      isSpeechSupported={isSpeechSupported}
                      onSpeak={handleSpeak}
                      speech={stat.speech}
                    />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{stat.note}</p>
                </Motion.div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="glass-panel-strong rounded-[28px] p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Why customers use BudgetFree
                  </p>
                  <CompactSpeakUpMenu
                    activeSpeechId={activeSpeechId}
                    cardId="why-customers-use-budgetfree"
                    isSpeechSupported={isSpeechSupported}
                    onSpeak={handleSpeak}
                    speech={whyCustomersSpeech}
                  />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {reasonsToUseBudgetFree.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[22px] bg-white/75 px-4 py-4 text-sm leading-6 text-slate-600"
                    >
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-2">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    How it works
                  </p>
                  <CompactSpeakUpMenu
                    activeSpeechId={activeSpeechId}
                    cardId="how-it-works"
                    isSpeechSupported={isSpeechSupported}
                    onSpeak={handleSpeak}
                    speech={howItWorksSpeech}
                  />
                </div>
                <div className="mt-4 space-y-3">
                  {quickSteps.map((item, index) => (
                    <div
                      key={item}
                      className="rounded-[22px] bg-white/70 px-4 py-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Motion.header>
        </div>
      </SiteChrome>
    </PageTransition>
  );
}
