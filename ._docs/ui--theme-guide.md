# 🚩 KOMPROMATOR UI & THEME GUIDE
## Soviet Constructivist State Surveillance Interface

---

## 🎯 **CORE DESIGN PHILOSOPHY**

### **Primary Aesthetic: 1920s Soviet Propaganda Poster Interface**
The Kompromator dashboard embodies a **digital surveillance tool that emerged from a Soviet propaganda poster**, featuring:
- **Bold geometric design** with sharp edges and zero rounded corners
- **Authoritative typography hierarchy** using Stalinist One for maximum impact
- **Strategic crimson accents** against neutral beige backgrounds
- **Professional state surveillance interface** that intimidates through authority
- **Thick propaganda-style borders** that command attention and respect

---

## 🎨 **IMPLEMENTED COLOR SYSTEM**

### **Primary Palette (FINAL)**
```css
--color-primary-crimson: #C11B17;      /* Main crimson - headers, actions, warnings */
--color-accent-black: #000000;         /* All text, borders, authority elements */
--color-background-beige: #F5EEDC;     /* Card backgrounds, headers, official areas */
--color-main-crimson: #C11B17;         /* Page background for intimidation */
--color-success-muted: #5A7761;        /* Military green for completed states */
```

### **Strategic Color Usage Rules**
- **Crimson (#C11B17):** Reserved for KOMPROMATOR title, critical warnings, and current status indicators
- **Black (#000000):** ALL body text, borders, and structural elements
- **Beige (#F5EEDC):** Card backgrounds, headers, footers - official document feel
- **Military Green (#5A7761):** Only for success states and completed missions

---

## ✍️ **TYPOGRAPHY SYSTEM (IMPLEMENTED)**

### **Font Stack (ENFORCED)**
```css
--font-family-display: 'Stalinist One', 'Arial Black', sans-serif;
--font-family-body: 'Roboto Condensed', 'Arial', sans-serif;
```

### **Typography Classes (ACTIVE)**
```css
.text-propaganda-title {
  font-family: 'Stalinist One', 'Arial Black', sans-serif !important;
  font-size: 3rem !important; /* 48px */
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.15em !important;
}

.text-card-title {
  font-family: 'Stalinist One', 'Arial Black', sans-serif !important;
  font-size: 1.5rem !important; /* 24px */
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  color: var(--color-text-primary) !important;
}

.text-subtitle {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 0.875rem; /* 14px */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### **Font Loading Rules**
- **CRITICAL:** All card titles MUST use `text-card-title` class
- **CRITICAL:** All major headers MUST use `text-propaganda-title` class  
- **CRITICAL:** Force font loading with `!important` declarations
- **Button text:** Minimum 14px (`font-size-sm`) for readability

---

## 🏗️ **LAYOUT ARCHITECTURE (DASHBOARD STANDARD)**

### **Main Dashboard Structure (ENFORCED)**
```jsx
{/* Header: 6px border-bottom, beige background */}
<header className="bg-[var(--color-background-beige)] border-b-[6px] border-[var(--color-accent-black)]">

{/* Primary Row: 25% Tasks Sidebar + 75% Calendar */}
<div className="flex gap-4 min-h-[calc(100vh-200px)]">
  <div className="w-1/4 min-w-[280px]">IMMEDIATE DIRECTIVES</div>
  <div className="flex-1">OPERATIONAL CALENDAR</div>
</div>

{/* Bottom Row: 1:2:1 ratio - State:Command:Intel */}
<div className="flex gap-4 h-[250px]">
  <div className="flex-[1]">STATE COLLATERAL</div>
  <div className="flex-[2]">COMMAND ACTIONS</div>  {/* 2x space */}
  <div className="flex-[1]">CLASSIFIED INTEL</div>
</div>

{/* Footer: 6px border-top, compressed */}
<footer className="bg-[var(--color-background-beige)] border-t-[6px] border-[var(--color-accent-black)]">
```

### **Critical Spacing Rules**
- **Container max-width:** 1400px with auto margins
- **Grid gaps:** 16px between major sections
- **Card padding:** 24px internal padding
- **Footer:** Compressed to minimal height with 4px internal padding

---

## 🔲 **BORDER SYSTEM (IMPLEMENTED)**

### **Border Hierarchy (ENFORCED)**
```css
/* Major structural elements */
border-[6px] border-[var(--color-accent-black)]  /* Headers, footers */

/* Card containers */
border-[6px] border-[var(--color-border-primary)]  /* Main cards */

/* Card sections */
border-b-[4px] border-[var(--color-border-primary)]  /* Card headers */
border-t-[4px] border-[var(--color-border-primary)]  /* Card footers */

/* Calendar elements */
border: 2px solid #000000  /* Calendar container */
border: 1px solid #000000  /* Calendar cells */
```

### **Border Rules (MANDATORY)**
- **ZERO border radius:** `border-radius: 0px !important` on ALL elements
- **Black borders only:** `#000000` for all structural borders
- **Thick is better:** Minimum 4px for major elements, 6px for primary structure
- **Sharp geometric definition:** Every element must have clear border definition

---

## 🎮 **BUTTON SYSTEM (DASHBOARD IMPLEMENTATION)**

### **Button Grid Layout (ENFORCED)**
```jsx
{/* 3x2 Grid - 6 buttons in Command Actions panel */}
<div className="grid grid-cols-3 gap-2 h-full">
  <Button className="h-16 text-center">
    <div className="flex flex-col items-center justify-center gap-1">
      <span className="text-xl">{ICON}</span>
      <span className="text-sm font-bold leading-tight">{LABEL}</span>
    </div>
  </Button>
</div>
```

### **Button Typography Standards**
- **Text size:** Minimum 14px (`text-sm`) for readability
- **Font weight:** Bold for all button labels  
- **Icon size:** 20px (`text-xl`) for clear visibility
- **Layout:** Vertical icon + text with center alignment
- **Height:** 64px (`h-16`) minimum for proper text display

---

## 📅 **CALENDAR SYSTEM (DASHBOARD STANDARD)**

### **View Configuration (IMPLEMENTED)**
```jsx
<Calendar
  views={['month', 'week']}           // No day view - unnecessary
  defaultView="month"                 // Always start in month view
  height: '450px'                     // Optimized for deadline display
  showMultiDayTimes={false}           // Remove hourly granularity
  popup={true}                        // Enable event details
  drilldownView={null}                // Disable day view drilling
/>
```

### **Calendar Styling Rules (ENFORCED)**
- **Month view:** Full calendar grid like reference image structure
- **Week view:** Compact without hourly slots - deadline focused
- **Event display:** Small chips within date cells, not time-based slots
- **Navigation:** Stalinist One typography in black/crimson buttons
- **No hourly granularity:** Optimized for deadlines, not meetings

### **Calendar Colors (IMPLEMENTED)**
```css
.rbc-header { background: #000000; color: #F5EEDC; }
.rbc-today { background: #C11B17; color: #F5EEDC; }
.rbc-event { background: #C11B17; border: 1px solid #000000; }
.rbc-toolbar-label { color: #000000; font-family: 'Stalinist One'; }
```

---

## 🔧 **COMPONENT IMPLEMENTATION STANDARDS**

### **Card Component Rules (ACTIVE)**
```tsx
// All cards must use thick borders and beige backgrounds
<Card className="border-[6px] border-[var(--color-border-primary)] bg-[var(--color-background-beige)]">
  <CardHeader className="border-b-[4px] border-[var(--color-border-primary)]">
    <CardTitle className="text-card-title">TITLE IN CAPS</CardTitle>
    <CardDescription className="text-subtitle">Subtitle description</CardDescription>
  </CardHeader>
  <CardContent className="p-[var(--space-6)]">Content here</CardContent>
  <CardFooter className="border-t-[4px] border-[var(--color-border-primary)]">Footer</CardFooter>
</Card>
```

### **Text Color Enforcement (CRITICAL)**
- **ALL header text:** Black (`var(--color-text-primary)`) with inline style overrides
- **Crimson text:** Only for KOMPROMATOR title and critical status indicators
- **Force color inheritance:** Use `style={{color: 'var(--color-text-primary)'}}` when needed

---

## 📐 **RESPONSIVE BEHAVIOR (DASHBOARD PROVEN)**

### **Desktop Layout (PRIMARY)**
- **Main grid:** 25% sidebar + 75% calendar (minimum 280px sidebar)
- **Bottom grid:** 1:2:1 ratio (State:Command:Intel)
- **Container:** Max 1400px width with auto margins
- **Button grid:** 3x2 layout in expanded Command Actions panel

### **Mobile Adaptation (PLANNED)**
- **Sidebar behavior:** Stack below calendar on narrow screens
- **Button layout:** Maintain readability with proper touch targets
- **Text scaling:** Ensure 14px minimum on all screen sizes

---

## ⚡ **IMPLEMENTATION CHECKLIST FOR NEW COMPONENTS**

### **Typography Requirements**
- [ ] **Import fonts:** Ensure Stalinist One + Roboto Condensed loaded
- [ ] **Apply classes:** Use `.text-card-title` for all card headers
- [ ] **Force loading:** Add `!important` declarations for font-family
- [ ] **Text size:** Minimum 14px for readability, 24px for card titles

### **Color Requirements**  
- [ ] **Black text:** All body text in `var(--color-text-primary)`
- [ ] **Beige backgrounds:** All cards in `var(--color-background-beige)`
- [ ] **Crimson accents:** Only for titles, warnings, and status
- [ ] **Force inheritance:** Use inline styles when CSS cascade fails

### **Border Requirements**
- [ ] **Zero radius:** `border-radius: 0px !important` everywhere
- [ ] **Thick borders:** 6px for containers, 4px for sections
- [ ] **Black borders:** `#000000` for all structural elements
- [ ] **Sharp definition:** Every element needs clear geometric borders

### **Layout Requirements**
- [ ] **Grid systems:** Use flexbox with specific ratios (not equal widths)
- [ ] **Proper heights:** Allow content to breathe (250px+ for button grids)
- [ ] **Gap consistency:** 16px between major sections
- [ ] **Container constraints:** Max 1400px with proper padding

---

## 🛠️ **TECHNICAL IMPLEMENTATION NOTES**

### **CSS Override Strategy**
- **Use `!important`** for critical font and color declarations
- **Inline styles** when CSS cascade conflicts occur
- **CSS-in-JS** for complex component-specific overrides (like calendar)
- **Design tokens** through CSS variables for consistency

### **React Component Patterns**
- **Compound components** for Cards with Header/Content/Footer structure
- **Flexible layouts** using CSS Grid and Flexbox with specific ratios
- **Forced typography** through className and style prop combinations
- **State-driven styling** for interactive elements

---

## 🎖️ **QUALITY STANDARDS (DASHBOARD PROVEN)**

### **Visual Quality Checkpoints**
- [x] All card titles display in Stalinist One font
- [x] All header/footer text is black (except KOMPROMATOR title = crimson)
- [x] Month view calendar displays proper grid with dates  
- [x] All 6 command buttons fit without overflow in 3x2 layout
- [x] Text "ESTABLISH COLLATERAL" fully visible and readable
- [x] Footer text fits within bounds with proper compression
- [x] Thick black borders on all major elements (6px containers, 4px sections)

### **Functional Quality Standards**
- [x] Calendar shows deadlines without hourly time slots
- [x] Button grid adapts with 3x2 layout and increased height (64px buttons)
- [x] All text readable at 14px minimum size
- [x] No text overflow or truncation anywhere
- [x] 1:2:1 ratio in bottom panel gives Command Actions proper space

### **Authority & Intimidation Factors**
- [x] Dashboard feels like Soviet state surveillance tool
- [x] Typography hierarchy guides attention with propaganda fonts
- [x] Color scheme creates authority through stark contrast
- [x] Professional quality matching modern productivity apps
- [x] Geometric precision enforces state authority aesthetic

---

## 🚨 **CRITICAL RULES FOR ALL FUTURE COMPONENTS**

### **NON-NEGOTIABLE REQUIREMENTS**
1. **ZERO rounded corners** - `border-radius: 0px !important` everywhere
2. **Stalinist One** for all titles and headers with `!important` loading
3. **Black text default** - For paragraph and normal text items, Force with inline styles if needed  
4. **Thick borders** - 6px for containers, 4px for sections, 2px minimum
5. **Beige card backgrounds** - All cards use `--color-background-beige`
6. **14px minimum text** - All text must be readable
7. **Strategic crimson** - Only for titles, headings, warnings, and critical status

### **BANNED ELEMENTS**
- ❌ **Rounded corners** on any element
- ❌ **Drop shadows** or soft visual effects  
- ❌ **Gradients** or soft color transitions
- ❌ **Small text** below 14px
- ❌ **Pastel colors** or soft aesthetics
- ❌ **Casual typography** or script fonts

---

**REMEMBER: THE STATE DEMANDS GEOMETRIC PRECISION. EVERY PIXEL SERVES THE REVOLUTION!** 🚩