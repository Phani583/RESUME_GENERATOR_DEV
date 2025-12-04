// Single-form version using plain JS + localStorage

(function () {
  const qs = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));

  const data = loadFromStorage() || getDefaultData();
  // --- MIGRATION / NORMALIZATION: make sure all fields exist even if old localStorage is loaded
  (() => {
    const def = getDefaultData();
    // ensure nested objects have all keys
    data.personalInfo = { ...def.personalInfo, ...(data.personalInfo || {}) };
    data.publicLinks = { ...def.publicLinks, ...(data.publicLinks || {}) };
    // ensure arrays always exist
    [
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "internships",
      "hobbies",
      "languages",
    ].forEach((k) => {
      if (!Array.isArray(data[k])) data[k] = [];
    });
  })();
  if (typeof data.additionalInfo !== "string") data.additionalInfo = "";
  if (typeof data.declaration !== "string") data.declaration = "";

  const els = {
    // core
    fullName: qs("#fullName"),
    profilePhoto: qs("#profilePhoto"), // ✅ new

    email: qs("#email"),
    phone: qs("#phone"),
    location: qs("#location"),
    summary: qs("#summary"),
    github: qs("#github"),
    linkedin: qs("#linkedin"),
    portfolio: qs("#portfolio"),
    website: qs("#website"),
    addCustomLink: qs("#addCustomLink"), // button
    customLinksList: qs("#customLinksList"), // container

    expList: qs("#experienceList"),
    eduList: qs("#educationList"),
    skillsList: qs("#skillsList"),
    projectsList: qs("#projectsList"),
    certificationsList: qs("#certificationsList"),
    internshipsList: qs("#internshipsList"),
    addAchievement: qs("#addAchievement"),
  achievementsList: qs("#achievementsList"),
    hobbiesList: qs("#hobbiesList"),
    additionalInfo: qs("#additionalInfo"),
    declaration: qs("#declaration"),

    // addHobby: qs("#addHobby"),

    btnSave: qs("#btn-save"),

    btnClear: qs("#btn-clear"),

    btnPreview: qs("#btn-preview"),

    addExperience: qs("#addExperience"),
    addEducation: qs("#addEducation"),
    addSkill: qs("#addSkill"),
    addProject: qs("#addProject"),
    addCertification: qs("#addCertification"),
    addInternship: qs("#addInternship"),
    addHobby: qs("#addHobby"),
    addLanguage: qs("#addLanguage"),
    languagesList: qs("#languagesList"),
  };

  // ===== Defaults (mirrors your zip structure) =====
  function getDefaultData() {
    return {
      personalInfo: {
        fullName: "",
        profilePhoto: "", // ✅ new

        email: "",
        phone: "",
        location: "",
        summary: "",
      },
      publicLinks: {
        github: "",
        linkedin: "",
        portfolio: "",
        website: "",
        custom: [], // ✅ new array for dynamic links
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      internships: [],
      achievements: [],
      hobbies: [],
      languages: [],
      additionalInfo: "", // ✅ new field
      declaration: "",
    };
  }

  // ===== Init form with stored data =====
  function initForm() {
    const { personalInfo, publicLinks } = data;
    els.fullName.value = personalInfo.fullName || "";
    if (personalInfo.profilePhoto) {
      els.profilePhoto.setAttribute("data-has-photo", "true"); // ✅ marks existing photo
    }

    els.email.value = personalInfo.email || "";
    els.phone.value = personalInfo.phone || "";
    els.location.value = personalInfo.location || "";
    els.summary.value = personalInfo.summary || "";

    els.github.value = publicLinks.github || "";
    els.linkedin.value = publicLinks.linkedin || "";
    els.portfolio.value = publicLinks.portfolio || "";
    els.website.value = publicLinks.website || "";
    els.additionalInfo.value = data.additionalInfo || "";
    els.declaration.value = data.declaration || "";

    renderExperience();
    renderEducation();
    renderSkills();
    renderProjects();
    renderCertifications();
    renderInternships();
    renderHobbies();
    renderCustomLinks();
    renderLanguages();
    renderAchievements();
  }

  // ===== Storage =====
  function saveToStorage(showToast = false) {
    try {
      localStorage.setItem("resumeData", JSON.stringify(data));
      if (showToast) {
        toast("Saved", "Your progress has been saved locally.");
      }
    } catch (e) {
      alert("Unable to save to localStorage. Check browser settings.");
    }
  }
  // ---- Debounced save helper (make available globally) ----
  function debounce(fn, wait = 500) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  const debouncedSaveToStorage = debounce(() => saveToStorage(false), 600);

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem("resumeData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function clearAll() {
    if (!confirm("Clear all fields?")) return;
    {
      const fresh = getDefaultData();
      Object.assign(data.personalInfo, fresh.personalInfo);
      Object.assign(data.publicLinks, fresh.publicLinks);
      data.experience = [];
      data.education = [];
      data.skills = [];
      data.projects = [];
      data.certifications = [];
      data.internships = [];
      data.hobbies = [];
      data.achievements = [];
      data.additionalInfo = "";
      data.declaration = "";

      data.languages = [];
      // explicitly clear profile photo (base64 string)
      if (data.personalInfo) data.personalInfo.profilePhoto = "";

      initForm();
      saveToStorage(true);
      // 🧹 FIX: remove red highlight and error messages after clear
      document.querySelectorAll(".invalid-highlight").forEach((el) => {
        el.classList.remove("invalid-highlight");
      });

      document.querySelectorAll(".error-msg").forEach((msg) => {
        msg.remove();
      });
    }
  }

  // ===== Mini toast =====
  function toast(title, msg) {
    const div = document.createElement("div");
    div.className = "toast";
    div.style.cssText = `
      position: fixed; right: 16px; bottom: 16px; z-index: 9999;
      background: #0f172a; border: 1px solid #233156; color: #e6edf7;
      padding: 12px 14px; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,.35);
      max-width: 300px; font-size: 14px;
    `;
    div.innerHTML = `<strong>${title}</strong><div style="opacity:.8;margin-top:6px">${msg}</div>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2200);
  }

  // ===== Bind top fields -> data =====
  ["input", "change"].forEach((evt) => {
    els.fullName.addEventListener(
      evt,
      (e) => (data.personalInfo.fullName = e.target.value)
    );
    els.email.addEventListener(
      evt,
      (e) => (data.personalInfo.email = e.target.value)
    );
    els.phone.addEventListener(
      evt,
      (e) => (data.personalInfo.phone = e.target.value)
    );
    els.location.addEventListener(
      evt,
      (e) => (data.personalInfo.location = e.target.value)
    );
    els.summary.addEventListener(
      evt,
      (e) => (data.personalInfo.summary = e.target.value)
    );

    els.github.addEventListener(
      evt,
      (e) => (data.publicLinks.github = e.target.value)
    );
    els.linkedin.addEventListener(
      evt,
      (e) => (data.publicLinks.linkedin = e.target.value)
    );
    els.portfolio.addEventListener(
      evt,
      (e) => (data.publicLinks.portfolio = e.target.value)
    );
    els.website.addEventListener(
      evt,
      (e) => (data.publicLinks.website = e.target.value)
    );
    // ✅ Profile photo upload
    els.profilePhoto.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          data.personalInfo.profilePhoto = evt.target.result; // store base64
          saveToStorage();
        };
        reader.readAsDataURL(file);
      }
    });

    els.additionalInfo.addEventListener(evt, (e) => {
      data.additionalInfo = e.target.value;
      // autosave (debounced) while typing
      debouncedSaveToStorage();
    });

    // also save immediately when user leaves the field (optional but recommended)
    els.additionalInfo.addEventListener("blur", () => {
      saveToStorage(false);
    });

    els.declaration.addEventListener(
      evt,
      (e) => (data.declaration = e.target.value)
    );
  });

  // ===== Experience =====
  els.addExperience.addEventListener("click", () => {
    data.experience.push({
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    renderExperience();
    saveToStorage();
  });
  function renderExperience() {
    els.expList.innerHTML = "";
    data.experience.forEach((exp, i) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-header">
          <span class="list-item-title">Experience ${i + 1}</span>
          <div class="row" style="grid-template-columns:auto auto; gap:6px">
            <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
          </div>
        </div>
        <div class="row row-2">
          <label>Job Title <input class="input" data-k="jobTitle" data-i="${i}" value="${escapeHtml(
        exp.jobTitle
      )}"></label>
          <label>Company <input class="input" data-k="company" data-i="${i}" value="${escapeHtml(
        exp.company
      )}"></label>
        </div>
       <div class="row row-2">
  <label>Start Year
    <input class="input"
      type="number"
     
      data-k="startDate"
      data-i="${i}"
      placeholder="e.g. 2020"
      value="${exp.startDate || ""}">
  </label>

  <label>End Year
    <input class="input"
      type="number"
     
      data-k="endDate"
      data-i="${i}"
      placeholder="e.g. 2024"
      ${exp.current ? "disabled" : ""}
      value="${exp.endDate || ""}">
  </label>
</div>

<label class="full" style="display:flex;align-items:center;gap:8px;">
  <input type="checkbox" data-k="current" data-i="${i}" ${exp.current ? "checked" : ""}/>
  Currently working here
</label>


        <label>Description
          <textarea class="textarea" data-k="description" data-i="${i}" rows="3">${escapeHtml(
        exp.description || ""
      )}</textarea>
        </label>
      `;
      div.querySelector("[data-remove]").addEventListener("click", () => {
        data.experience.splice(i, 1);
        renderExperience();
        saveToStorage();
      });
      attachChangeHandlers(
        div,
        data.experience,
        i,
        (arr, idx, key, val, el) => {
          if (key === "current") {
            arr[idx].current = el.checked;
            const endInput = div.querySelector('input[data-k="endDate"]');
            if (endInput) {
              if (el.checked) {
                endInput.value = "";
                arr[idx].endDate = "";
                endInput.disabled = true;
                endInput.classList.add("dimmed"); // ✅ add dimmed
              } else {
                endInput.disabled = false;
                endInput.classList.remove("dimmed"); // ✅ remove dimmed
              }
            }
          } else {
            arr[idx][key] = val;
          }
        }
      );

      els.expList.appendChild(div);
    });
  }

  // ... your existing code above ...

  // ===== Education =====
  els.addEducation.addEventListener("click", () => {
    data.education.push({
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      current: false, // ✅ new field for "Currently studying"
      score: "", // store CGPA/Marks/Grade value
      scoreType: "", // default selection //
      description: "",
    });
    renderEducation();
    saveToStorage();
  });

  function renderEducation() {
    els.eduList.innerHTML = "";
    data.education.forEach((edu, i) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
      <div class="list-item-header">
        <span class="list-item-title">Education ${i + 1}</span>
        <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
      </div>
      <div class="row row-2">
        <label>Degree/Course <input class="input" data-k="degree" data-i="${i}" value="${escapeHtml(
        edu.degree
      )}"></label>
        <label>Institution <input class="input" data-k="institution" data-i="${i}" value="${escapeHtml(
        edu.institution
      )}"></label>
      </div>
    <div class="row row-2">
  <label>
    Start Year
    <input class="input" type="number" 
    data-k="startDate" data-i="${i}" placeholder="e.g. 2022"
    value="${edu.startDate || ''}">
  </label>

  <label>
    End Year
    <input class="input" type="number" 
    data-k="endDate" data-i="${i}" placeholder="e.g. 2024"
    ${edu.current ? "disabled" : ""}
    value="${edu.endDate || ''}">
  </label>
</div>

      <div class="row row-2">
        <label class="full" style="display:flex;align-items:center;gap:10px;">
          <input type="checkbox" data-k="current" data-i="${i}" ${
        edu.current ? "checked" : ""
      }/> Currently studying here
        </label>
      </div>
      <div class="row row-2">
        <label>Score
          <input class="input" data-k="score" data-i="${i}" value="${escapeHtml(
        edu.score || ""
      )}">
        </label>
        <label>Type
          <div style="display:flex;gap:10px;">
            <label><input type="radio" name="scoreType_${i}" value="CGPA" ${
        edu.scoreType === "CGPA" ? "checked" : ""
      }/> CGPA</label>
            <label><input type="radio" name="scoreType_${i}" value="Marks" ${
        edu.scoreType === "Marks" ? "checked" : ""
      }/> Marks</label>
            <label><input type="radio" name="scoreType_${i}" value="Grade" ${
        edu.scoreType === "Grade" ? "checked" : ""
      }/> Grade</label>
          </div>
        </label>
      </div>
      <label>Description
        <textarea class="textarea" data-k="description" data-i="${i}" rows="3">${escapeHtml(
        edu.description || ""
      )}</textarea>
      </label>
    `;

      // Remove button
      div.querySelector("[data-remove]").addEventListener("click", () => {
        data.education.splice(i, 1);
        renderEducation();
        saveToStorage();
      });

      // Attach input/change handlers
      attachChangeHandlers(div, data.education, i, (arr, idx, key, val, el) => {
        if (key === "current") {
          arr[idx].current = el.checked;
          const endInput = div.querySelector('input[data-k="endDate"]');
          if (endInput) {
            endInput.disabled = el.checked;
            if (el.checked) {
              endInput.value = "";
              arr[idx].endDate = "";
              endInput.classList.add("dimmed");
            } else {
              endInput.classList.remove("dimmed");
            }
          }
        } else if (key === "scoreType") {
          arr[idx].scoreType = val;
        } else arr[idx][key] = val;
      });

      // ✅ Add listener to radio buttons to update scoreType
      div.querySelectorAll(`input[name="scoreType_${i}"]`).forEach((radio) => {
        radio.addEventListener("change", (e) => {
          data.education[i].scoreType = e.target.value;
          saveToStorage();
        });
      });

      els.eduList.appendChild(div);
    });
  }

  // // ... rest of your existing code unchanged ...
  // // ... your existing code above ...
  // ... rest of your existing code unchanged ...

  // ===== Skills (input first, pills below, cards stay visible) =====
  const SKILL_PILLS = [
    { name: "JavaScript", category: "Programming Language" },
    { name: "Python", category: "Programming Language" },
    { name: "C++", category: "Programming Language" },
    { name: "Java", category: "Programming Language" },
    { name: "React", category: "Framework" },
    { name: "HTML", category: "Web Designing" },
    { name: "CSS", category: "Web Designing" },
    { name: "SQL", category: "Database" },
    { name: "MATLAB", category: "Tool" },
    { name: "PLC", category: "Electronics" },
    { name: "VLSI", category: "Electronics" },
    { name: "AthoCad", category: "Designing" },
    { name: "Git/Github", category: "Tool" },
  ];

  const CATEGORY_PILLS = [
    "Programming Language",
    "Framework",
    "Tool",
    "Electronics",
    "Data Science",
  ];

  els.addSkill.addEventListener("click", () => {
    // keep collapsed state so UI toggling won’t break others
    data.skills.push({
      name: "",
      category: "",
      level: "Beginner",
      collapsed: false,
    });
    renderSkills();
    saveToStorage();
  });

  let activeSkillPillState = {};
  // keeps track of which pill is active per skill index

  function renderSkills() {
    els.skillsList.innerHTML = "";

    data.skills.forEach((skill, i) => {
      const div = document.createElement("div");
      div.className = "list-item";

      // check saved pill state
      const activeName = skill.name;
      const activeCat = skill.category;

      div.innerHTML = `
      <div class="list-item-header">
        <span class="list-item-title">Skill ${i + 1}</span>
        <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
      </div>
      <div class="row row-3">
        <label>Skill Name 
          <input class="input" data-k="name" data-i="${i}" value="${escapeHtml(
        skill.name
      )}">
        </label>
        <label>Category 
          <input class="input" data-k="category" data-i="${i}" value="${escapeHtml(
        skill.category
      )}">
        </label>
        <label>Level
          <select class="select" data-k="level" data-i="${i}">
            <option ${
              skill.level === "Beginner" ? "selected" : ""
            }>Beginner</option>
            <option ${
              skill.level === "Intermediate" ? "selected" : ""
            }>Intermediate</option>
            <option ${
              skill.level === "Expert" ? "selected" : ""
            }>Expert</option>
          </select>
        </label>
      </div>
      <div class="skills-pills" style="margin-top:10px;">
        ${SKILL_PILLS.map(
          ({ name, category }) => `
            <button type="button" class="pill-btn ${
              name === activeName ? "active" : ""
            }" 
              data-skill="${name}" data-cat="${category}" style="margin:4px;">
              ${name}
            </button>`
        ).join("")}
      </div>
    `;

      // remove skill
      div.querySelector("[data-remove]").addEventListener("click", () => {
        data.skills.splice(i, 1);
        renderSkills();
        saveToStorage();
      });

      attachChangeHandlers(div, data.skills, i);

      // handle pill clicks
      div.querySelectorAll(".pill-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const allPills = [...div.querySelectorAll(".pill-btn")];
          const isActive = btn.classList.contains("active");
          const skillName = btn.dataset.skill;
          const cat = btn.dataset.cat;

          const nameInput = div.querySelector('input[data-k="name"]');
          const catInput = div.querySelector('input[data-k="category"]');

          if (isActive) {
            // unselect
            btn.classList.remove("active");
            allPills.forEach((p) => (p.style.display = "inline-block"));
            nameInput.value = "";
            catInput.value = "";
            data.skills[i].name = "";
            data.skills[i].category = "";
          } else {
            // select → autofill
            allPills.forEach((p) => {
              p.classList.remove("active");
              p.style.display = p === btn ? "inline-block" : "none";
            });
            btn.classList.add("active");
            nameInput.value = skillName;
            catInput.value = cat;
            data.skills[i].name = skillName;
            data.skills[i].category = cat;
          }
          saveToStorage();
        });
      });

      // maintain state when reopened
      if (activeName) {
        div.querySelectorAll(".pill-btn").forEach((p) => {
          if (p.dataset.skill === activeName) {
            p.classList.add("active");
            p.style.display = "inline-block";
          } else {
            p.style.display = "none";
          }
        });
      }

      els.skillsList.appendChild(div);
    });
  }
  // ===== Projects =====
  els.addProject.addEventListener("click", () => {
    data.projects.push({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      projectUrl: "",
    });

    renderProjects();
    saveToStorage();
  });
  function renderProjects() {
    els.projectsList.innerHTML = "";
    data.projects.forEach((project, i) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
      <div class="list-item-header">
        <span class="list-item-title">Project ${i + 1}</span>
        <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
      </div>
      <div class="row row-2">
        <label>Project Name <input class="input" data-k="name" data-i="${i}" value="${escapeHtml(
        project.name
      )}"></label>
        <label>Project URL <input class="input" type="url" data-k="projectUrl" data-i="${i}" value="${escapeHtml(
        project.projectUrl || ""
      )}"></label>
      </div>
     <div class="row row-2">
  <label>Start Year
    <input class="input"type="number"placeholder="e.g. 2021"data-k="startDate"data-i="${i}"value="${project.startDate || ""}">
  </label>

  <label>End Year
    <input class="input"type="number"placeholder="e.g. 2023"data-k="endDate" data-i="${i}"value="${project.endDate || ""}">
  </label>
</div>

      <label>Description 
        <textarea class="textarea" rows="3" data-k="description" data-i="${i}">${escapeHtml(
        project.description || ""
      )}</textarea>
      </label>
    `;

      // ✅ Remove project
      div.querySelector("[data-remove]").addEventListener("click", () => {
        data.projects.splice(i, 1);
        renderProjects();
        saveToStorage();
      });

      // ✅ Attach input change handlers
      attachChangeHandlers(div, data.projects, i);

      // ✅ Finally append to DOM
      els.projectsList.appendChild(div);
    });
  }
  // ===== Certificates =====
  els.addCertification.addEventListener("click", () => {
    data.certifications.push({
      name: "",
      issuer: "",
      date: "",
      description: "",
      url: "",
    });
    renderCertifications();
    saveToStorage();
  });

  function renderCertifications() {
    els.certificationsList.innerHTML = "";
    data.certifications.forEach((cert, i) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-header">
          <span class="list-item-title">Certification ${i + 1}</span>
          <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
        </div>
        <div class="row row-2">
          <label>Certificate Name <input class="input" data-k="name" data-i="${i}" value="${escapeHtml(
        cert.name
      )}"></label>
          <label>Issuer <input class="input" data-k="issuer" data-i="${i}" value="${escapeHtml(
        cert.issuer
      )}"></label>
        </div>
        <div class="row row-2">
          <label>Date <input class="input" type="date" data-k="date" data-i="${i}" value="${
        cert.date || ""
      }"></label>
      <label>Certificate URL 
          <input class="input" type="url" placeholder="https://example.com/certificate" data-k="url" data-i="${i}" value="${escapeHtml(
        cert.url || ""
      )}">
        </label>
        </div>
        <label>Description
          <textarea class="textarea" data-k="description" data-i="${i}" rows="2">${escapeHtml(
        cert.description || ""
      )}</textarea>
        </label>
      `;
      div.querySelector("[data-remove]").addEventListener("click", () => {
        data.certifications.splice(i, 1);
        renderCertifications();
        saveToStorage();
      });
      attachChangeHandlers(div, data.certifications, i);
      els.certificationsList.appendChild(div);
    });
  }
  // ===== Internships (NEW) =====
  els.addInternship.addEventListener("click", () => {
    data.internships.push({
      name: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    renderInternships();
    saveToStorage();
  });
  function renderInternships() {
    els.internshipsList.innerHTML = "";
    data.internships.forEach((intern, i) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-header">
          <span class="list-item-title">Internship ${i + 1}</span>
          <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
        </div>
        <div class="row row-2">
          <label>Internship Name <input class="input" data-k="name" data-i="${i}" value="${escapeHtml(
        intern.name
      )}"></label>
          <label>Organization <input class="input" data-k="organization" data-i="${i}" value="${escapeHtml(
        intern.organization
      )}"></label>
        </div>
       <div class="row row-2">

  <label>Start Year
    <input class="input"type="number"data-k="startDate"data-i="${i}"placeholder="e.g. 2021"value="${intern.startDate || ''}">
  </label>

  <label>End Year
    <input class="input"type="number"data-k="endDate"data-i="${i}"placeholder="e.g. 2023"${intern.current ? "disabled" : ""}value="${intern.endDate || ''}">
  </label>

</div>

<label class="full" style="display:flex;align-items:center;gap:10px;margin-top:5px;">
  <input type="checkbox"
         data-k="current"
         data-i="${i}"
         ${intern.current ? "checked" : ""} />
  Currently working here
</label>

        <label>Description
          <textarea class="textarea" rows="3" data-k="description" data-i="${i}">${escapeHtml(
        intern.description || ""
      )}</textarea>
        </label>
      `;
      div.querySelector("[data-remove]").addEventListener("click", () => {
        data.internships.splice(i, 1);
        renderInternships();
        saveToStorage();
      });
      attachChangeHandlers(
        div,
        data.internships,
        i,
        (arr, idx, key, val, el) => {
          if (key === "current") {
            arr[idx].current = el.checked;
            const endInput = div.querySelector('input[data-k="endDate"]');
            if (endInput) {
              if (el.checked) {
                endInput.value = "";
                arr[idx].endDate = "";
                endInput.disabled = true;
                endInput.classList.add("dimmed"); // optional styling
              } else {
                endInput.disabled = false;
                endInput.classList.remove("dimmed");
              }
            }
          } else {
            arr[idx][key] = val;
          }
        }
      );

      els.internshipsList.appendChild(div);
    });
  }
  // ===== Achievements (MULTI TEXTAREA VERSION) =====
if (els.addAchievement) {
  els.addAchievement.addEventListener("click", () => {
    data.achievements.push({ text: "" });
    renderAchievements();
    saveToStorage();
  });
}

function renderAchievements() {
  if (!els.achievementsList) return;
  els.achievementsList.innerHTML = "";

  if (!Array.isArray(data.achievements)) data.achievements = [];

  data.achievements.forEach((ach, i) => {
    if (!ach || typeof ach !== "object") data.achievements[i] = { text: "" };

    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <div class="list-item-header">
        <span class="list-item-title">Achievement ${i + 1}</span>
        <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
      </div>

      <label class="full">
        <textarea class="textarea" rows="3" data-k="text" data-i="${i}" placeholder="Write your achievement...">${escapeHtml(ach.text || "")}</textarea>
      </label>
    `;

    // remove
    div.querySelector("[data-remove]").addEventListener("click", () => {
      data.achievements.splice(i, 1);
      renderAchievements();
      saveToStorage();
    });

    // autosave
    attachChangeHandlers(div, data.achievements, i);

    els.achievementsList.appendChild(div);
  });
}

  // ===== Hobbies =====
  els.addHobby.addEventListener("click", () => {
    data.hobbies.push({ hobby: "" });
    renderHobbies();
    saveToStorage();
  });

  function renderHobbies() {
    els.hobbiesList.innerHTML = "";
    // extra guard (works even if a future edit removes hobbies in storage)
    const list = Array.isArray(data.hobbies)
      ? data.hobbies
      : (data.hobbies = []);
    list.forEach((hob, i) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
      <div class="list-item-header">
        <span class="list-item-title">Hobby ${i + 1}</span>
        <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
      </div>
      <label>Hobby
        <input class="input" data-k="hobby" data-i="${i}" value="${escapeHtml(
        hob.hobby || ""
      )}">
      </label>
    `;

      div.querySelector("[data-remove]").addEventListener("click", () => {
        data.hobbies.splice(i, 1);
        renderHobbies();
        saveToStorage();
      });

      attachChangeHandlers(div, data.hobbies, i);
      els.hobbiesList.appendChild(div);
    });
  }
  // ===== Languages (REPLACEMENT: dropdown + preview) =====
  const LANGUAGES = [
    "English",
    "Hindi",
    "Telugu",
    "Tamil",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Urdu",
    "Bengali",
    "Odia",
    "Assamese",
    "Konkani",
    "Sanskrit",
    "Nepali",
    "Bhojpuri",
    "Rajasthani",
    "Sindhi",
    "Maithili",
    "Santali",
    "Dogri",
    "Kashmiri",
    "Chinese (Mandarin)",
    "Cantonese",
    "Japanese",
    "Korean",
    "Vietnamese",
    "Thai",
    "Indonesian",
    "Malay",
    "Filipino (Tagalog)",
    "Arabic",
    "Persian (Farsi)",
    "Turkish",
    "Hebrew",
    "Swahili",
    "Russian",
    "Polish",
    "Ukrainian",
    "Romanian",
    "Hungarian",
    "Czech",
    "Slovak",
    "Dutch",
    "German",
    "French",
    "Spanish",
    "Portuguese",
    "Italian",
    "Greek",
    "Latin",
  ];

  function createLanguageRow(
    index,
    selectedValue = "",
    levelValue = "Beginner"
  ) {
    const div = document.createElement("div");
    div.className = "list-item";

    const options = LANGUAGES.map(
      (L) => `<option value="${L}">${L}</option>`
    ).join("\n");

    div.innerHTML = `
  <div class="list-item-header">
    <span class="list-item-title">Language ${index + 1}</span>
    <button class="btn btn-small btn-danger" data-remove="${index}">Remove</button>
  </div>
  <div class="row row-2">
    <label>Language
      <select class="input compact-select" data-k="name" data-i="${index}">
        <option value="">-- Select language --</option>
        <option value="__custom__">Custom...</option>
        ${options}
      </select>
      <input class="input custom-lang-input" type="text"
             placeholder="Enter custom language" style="display:none;" />
    </label>

   <label>Level
  <select class="select" data-k="level" data-i="${index}">
    <option ${levelValue === "Native" ? "selected" : ""}>Native</option>
    <option ${levelValue === "Beginner" ? "selected" : ""}>Beginner</option>
    <option ${
      levelValue === "Intermediate" ? "selected" : ""
    }>Intermediate</option>
    <option ${levelValue === "Expert" ? "selected" : ""}>Expert</option>
    <option ${levelValue === "Proficient" ? "selected" : ""}>Proficient</option>
  </select>
</label>

  </div>
  `;

    const sel = div.querySelector("select[data-k='name']");
    const customInput = div.querySelector(".custom-lang-input");

    // Restore saved language
    if (selectedValue && LANGUAGES.includes(selectedValue)) {
      sel.value = selectedValue;
    } else if (selectedValue) {
      sel.value = "__custom__";
      customInput.style.display = "inline-block";
      customInput.value = selectedValue;
    }

    // Remove button
    div.querySelector("[data-remove]").addEventListener("click", () => {
      data.languages.splice(index, 1);
      renderLanguages();
      saveToStorage();
    });

    // Language dropdown change
    sel.addEventListener("change", (e) => {
      if (e.target.value === "__custom__") {
        customInput.style.display = "inline-block";
        data.languages[index].name = customInput.value;
        customInput.focus();
      } else {
        customInput.style.display = "none";
        data.languages[index].name = e.target.value;
      }
      saveToStorage();
      updatePreviewLanguages();
    });

    // Custom input
    customInput.addEventListener("input", (e) => {
      data.languages[index].name = e.target.value;
      saveToStorage();
      updatePreviewLanguages();
    });

    // ✅ Level dropdown handler
    const levelSelect = div.querySelector("select[data-k='level']");
    levelSelect.addEventListener("change", (e) => {
      data.languages[index].level = e.target.value;
      saveToStorage();
    });

    return div;
  }

  function renderLanguages() {
    els.languagesList.innerHTML = "";
    const list = Array.isArray(data.languages)
      ? data.languages
      : (data.languages = []);

    list.forEach((lang, i) => {
      if (typeof lang !== "object" || lang === null)
        data.languages[i] = { name: "", level: "Beginner" };
      const row = createLanguageRow(
        i,
        lang.name || "",
        lang.level || "Beginner"
      );
      els.languagesList.appendChild(row);
    });

    updatePreviewLanguages();
  }

  els.addLanguage.addEventListener("click", () => {
    data.languages.push({ name: "", level: "Beginner" }); // ✅ added level
    renderLanguages();
    saveToStorage();
  });

  // read languages from data
  function getLanguagesFromData() {
    return (Array.isArray(data.languages) ? data.languages : [])
      .map((l) => l.name)
      .filter(Boolean);
  }

  // Update an inline preview element if present on the page
  function updatePreviewLanguages() {
    const previewContainer = document.getElementById("previewLanguages");
    if (!previewContainer) return; // no inline preview on this page — preview.html should still read from localStorage
    const langs = getLanguagesFromData();
    previewContainer.textContent = langs.length
      ? langs.join(", ")
      : "No languages selected.";
  }

  // ensure preview buttons also refresh inline preview (if used)
  if (els.btnPreview)
    els.btnPreview.addEventListener("click", updatePreviewLanguages);
  if (els.btnPreview2)
    els.btnPreview2.addEventListener("click", updatePreviewLanguages);

  // run initial render (initForm already calls renderLanguages, but safe to call)
  renderLanguages();

  // ===== Custom Links (only Link Name + URL, no "Custom Link 1") =====
  if (els.addCustomLink) {
    els.addCustomLink.addEventListener("click", () => {
      data.publicLinks.custom.push({ name: "", url: "" });
      renderCustomLinks();
      saveToStorage();
    });
  }

  function renderCustomLinks() {
    if (!els.customLinksList) return;
    els.customLinksList.innerHTML = "";

    const list = Array.isArray(data.publicLinks.custom)
      ? data.publicLinks.custom
      : (data.publicLinks.custom = []);

    list.forEach((link, i) => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
     <div class="list-item-header">
  <span class="list-item-title">Custom Link ${i + 1}</span>
  <button class="btn btn-small btn-danger" data-remove="${i}">Remove</button>
</div>
<div class="row row-2">
  <label>Link Name
    <input class="input" data-k="name" data-i="${i}" 
           placeholder="e.g. YouTube, Portfolio, Instagram"
           value="${escapeHtml(link.name || "")}">
  </label>
  <label>Link URL
    <input class="input" type="url" data-k="url" data-i="${i}" 
           placeholder="https://example.com"
           value="${escapeHtml(link.url || "")}">
  </label>
</div>
 
    `;

      attachChangeHandlers(div, list, i);

      div.querySelector("[data-remove]").addEventListener("click", () => {
        data.publicLinks.custom.splice(i, 1);
        renderCustomLinks();
        saveToStorage();
      });

      els.customLinksList.appendChild(div);
    });
  }

  // ===== Helpers =====
  function attachChangeHandlers(scopeEl, arr, idx, onSpecial) {
    // text inputs + textarea
    scopeEl
      .querySelectorAll(
        'input[data-k]:not([type="checkbox"]), textarea[data-k], select[data-k]'
      )
      .forEach((el) => {
        el.addEventListener("input", () => {
          const k = el.getAttribute("data-k");
          const v = el.tagName === "SELECT" ? el.value : el.value;
          if (onSpecial) onSpecial(arr, idx, k, v, el);
          else arr[idx][k] = v;
          saveToStorage();
        });
        el.addEventListener("change", () => {
          const k = el.getAttribute("data-k");
          const v = el.tagName === "SELECT" ? el.value : el.value;
          if (onSpecial) onSpecial(arr, idx, k, v, el);
          else arr[idx][k] = v;
          saveToStorage();
        });
      });
    // checkboxes
    scopeEl.querySelectorAll('input[type="checkbox"][data-k]').forEach((el) => {
      el.addEventListener("change", () => {
        const k = el.getAttribute("data-k");
        if (onSpecial) onSpecial(arr, idx, k, el.checked, el);
        else arr[idx][k] = el.checked;
        saveToStorage();
      });
    });
  }

  function escapeHtml(s = "") {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[c])
    );
  }

  // ===== Validate required minimal ATS fields =====
  function validate() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(els.email.value.trim());
    const phoneDigits = (els.phone.value.match(/\d/g) || []).length;
    if (
      !els.fullName.value.trim() ||
      !els.summary.value.trim() ||
      !emailOk ||
      phoneDigits < 7
    ) {
      alert(
        "Please fill: Full Name, valid Email, valid Phone (≥7 digits), and Summary."
      );
      //---
      document.getElementById("step-1").click(); // simulate navbar click

      //---
      return false;
    }
    return true;
  }

  // ===== Preview (new window) =====
  function openPreview() {
    if (!validate()) return;

    // --- Load existing saved data ---
    let data = JSON.parse(localStorage.getItem("resumeData") || "{}");

    // --- 🔹 Fix: Update Declaration field ---
    const declarationField = document.getElementById("declaration");
    const declarationContainer = document.getElementById(
      "declarationContainer"
    );

    if (
      declarationContainer &&
      (declarationContainer.style.display === "none" ||
        declarationContainer.style.display === "")
    ) {
      data.declaration = "";
    } else if (declarationField) {
      data.declaration = declarationField.value.trim();
    }

    // --- 🔹 Fix: Update Public Links fields ---
    const linkFields = ["github", "linkedin", "portfolio", "website"];
    data.publicLinks = data.publicLinks || {};

    linkFields.forEach((key) => {
      const input = document.getElementById(key);
      if (input) {
        const val = input.value.trim();
        // Save only if not empty
        if (val) {
          data.publicLinks[key] = val;
        } else {
          delete data.publicLinks[key]; // 🧽 remove empty link
        }
      }
    });

    // --- Handle custom links (if you have dynamic inputs) ---
    const customLinksContainer = document.querySelectorAll(
      "#customLinksContainer .custom-link"
    );
    if (customLinksContainer && customLinksContainer.length > 0) {
      data.publicLinks.custom = Array.from(customLinksContainer)
        .map((el) => {
          const name = el.querySelector(".custom-name")?.value.trim();
          const url = el.querySelector(".custom-url")?.value.trim();
          return name && url ? { name, url } : null;
        })
        .filter(Boolean);
    } else {
      data.publicLinks.custom = [];
    }
    // ===== 🔹 Update: Add Achievements Data Before Saving to Preview =====
    // Read textarea values (we switched from <input> to <textarea>)
    const achievementsTextareas = document.querySelectorAll(
      "#achievementsList textarea"
    );
    if (achievementsTextareas && achievementsTextareas.length > 0) {
      data.achievements = Array.from(achievementsTextareas)
        .map((ta) => ta.value.trim())
        .filter((v) => v !== "")
        .map((v) => ({ achievement: v }));
    } else {
      data.achievements = [];
    }

    // --- Save updated data to localStorage ---
    localStorage.setItem("resumeData", JSON.stringify(data));

    // Debugging (optional)
    console.log("Saved before preview:", data.publicLinks);

    // --- Finally open preview ---
    // const w = window.open("preview.html", "_blank");

    // Open the selected preview page dynamically
    const selectedDesign =
      localStorage.getItem("selectedDesign") || "preview.html";
    window.open(selectedDesign, "_blank"); // opens in a new tab/window
  }

  // ===== Bind header/footer buttons =====
  els.btnSave.addEventListener("click", () => saveToStorage(true));
  els.btnClear.addEventListener("click", clearAll);
  els.btnPreview.addEventListener("click", openPreview);

  // Init
  initForm();
})();
// Validation + redirect-to-first-invalid implementation
function findFirstInvalidField() {
  // select all elements that are marked required
  const requiredEls = Array.from(document.querySelectorAll("[required]"));

  for (const el of requiredEls) {
    // Use built-in validity when possible (for email, url, etc.)
    // For file inputs, check files length; for others use value.trim()
    if (el.type === "file") {
      if (!el.files || el.files.length === 0) return el;
    } else {
      // treat empty string (including only-spaces) as invalid
      const val = (el.value || "").toString().trim();
      // For inputs with built-in validation use checkValidity
      if (typeof el.checkValidity === "function") {
        if (!el.checkValidity() || val === "") return el;
      } else {
        if (val === "") return el;
      }
    }
  }
  return null; // all required ok
}

function showInvalidCue(el) {
  if (!el) return;
  // focus + smooth scroll to center
  el.focus({ preventScroll: false });
  try {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (e) {
    // fallback
    el.scrollIntoView();
  }

  // temporary visual highlight (needs CSS .invalid-highlight)
  el.classList.add("invalid-highlight");
  setTimeout(() => el.classList.remove("invalid-highlight"), 1800);
}

function handlePreviewClick(e) {
  const firstInvalid = findFirstInvalidField();
  if (firstInvalid) {
    // prevent preview and redirect/focus to that field
    e && e.preventDefault && e.preventDefault();
    showInvalidCue(firstInvalid);
    return false;
  }

  // no invalid fields -> proceed to preview behavior
  // If you already have existing preview logic, call it here.
  // Example: openPreviewModal();
  console.log("All required fields filled — proceed to preview.");
  return true;
}

// attach to both preview buttons (top and footer)
document.addEventListener("DOMContentLoaded", () => {
  const previewBtn = document.getElementById("btn-preview");
  if (previewBtn) previewBtn.addEventListener("click", handlePreviewClick);

  // Optional: when user presses Enter in a required field, remove highlight
  document.addEventListener("input", (ev) => {
    const target = ev.target;
    if (
      target &&
      target.classList &&
      target.classList.contains("invalid-highlight")
    ) {
      const val = (target.value || "").toString().trim();
      if (val) target.classList.remove("invalid-highlight");
    }
  });
});
function findFirstInvalidField() {
  const requiredEls = Array.from(document.querySelectorAll("[required]"));

  for (const el of requiredEls) {
    if (el.type === "file") {
      if (!el.files || el.files.length === 0) return el;
    } else {
      const val = (el.value || "").toString().trim();
      if (typeof el.checkValidity === "function") {
        if (!el.checkValidity() || val === "") return el;
      } else {
        if (val === "") return el;
      }
    }
  }
  return null;
}

function showInvalidCue(el) {
  if (!el) return;

  // Focus + scroll
  el.focus({ preventScroll: false });
  el.scrollIntoView({ behavior: "smooth", block: "center" });

  // Add visual class
  el.classList.add("invalid-highlight");

  // Create or show error message
  let msg = el.parentNode.querySelector(".error-msg");
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "error-msg";
    msg.textContent = "Please enter this field";
    el.parentNode.appendChild(msg);
  } else {
    msg.style.display = "block";
  }
}

function clearError(el) {
  el.classList.remove("invalid-highlight");
  const msg = el.parentNode.querySelector(".error-msg");
  if (msg) msg.style.display = "none";
}

function handlePreviewClick(e) {
  const firstInvalid = findFirstInvalidField();
  if (firstInvalid) {
    e.preventDefault();
    showInvalidCue(firstInvalid);
    return false;
  }

  console.log("All required fields filled — proceed to preview.");
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const previewBtns = [
    document.getElementById("btn-preview"),
    document.getElementById("btn-preview-2"),
  ].filter(Boolean);

  previewBtns.forEach((btn) =>
    btn.addEventListener("click", handlePreviewClick)
  );

  // Clear error on typing
  document.addEventListener("input", (ev) => {
    const target = ev.target;
    if (target && target.hasAttribute("required")) {
      if (target.value.trim() !== "") clearError(target);
    }
  });

  // Clear Declaration
  document.getElementById("clear").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the declaration field?")) {
      const declarationField = document.getElementById("declaration");
      if (declarationField) declarationField.value = "";
    }
  });
});
// ===== Keyboard Navigation (Enter + Arrow Keys) =====
document.addEventListener("DOMContentLoaded", () => {
  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function getFocusableElements() {
    const selector = [
      'input:not([type="hidden"]):not([disabled])',
      "textarea:not([disabled])",
      "select:not([disabled])",
      "button:not([disabled])",
      '[contenteditable="true"]',
    ].join(",");
    return Array.from(document.querySelectorAll(selector)).filter(isVisible);
  }

  const excludedTypes = new Set([
    "checkbox",
    "radio",
    "file",
    "submit",
    "reset",
    "button",
    "image",
    "range",
    "color",
    "hidden",
  ]);

  function moveFocus(current, dir) {
    const focusables = getFocusableElements();
    const idx = focusables.indexOf(current);
    if (idx === -1) return;
    const next = focusables[idx + dir];
    if (!next) return;
    next.focus();
    if (
      next.select &&
      (next.tagName === "INPUT" || next.tagName === "TEXTAREA")
    ) {
      next.select();
    }
    if (typeof next.scrollIntoView === "function") {
      next.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  document.addEventListener("keydown", (e) => {
    const el = e.target;
    const tag = el.tagName.toLowerCase();
    const type = (el.type || "").toLowerCase();

    if (e.metaKey || e.altKey) return; // ignore shortcuts

    if (e.key === "Enter") {
      if (tag === "button" || excludedTypes.has(type)) return;

      if (tag === "textarea") {
        if (e.shiftKey) return; // allow Shift+Enter newline
      }
      e.preventDefault();
      moveFocus(el, +1);
    }

    if (e.key === "ArrowDown") {
      if (tag === "textarea" && !e.ctrlKey) return;
      e.preventDefault();
      moveFocus(el, +1);
    }
    if (e.key === "ArrowUp") {
      if (tag === "textarea" && !e.ctrlKey) return;
      e.preventDefault();
      moveFocus(el, -1);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const steps = Array.from(document.querySelectorAll(".wizard-step"));
  const prevBtn = document.getElementById("prevStep");
  const nextBtn = document.getElementById("nextStep");
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((s, i) => (s.style.display = i === index ? "block" : "none"));
    prevBtn.style.display = index === 0 ? "none" : "inline-block";

    // 👇 Hide Next button on last step (no Preview here)
    if (index === steps.length - 1) {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "inline-block";
      nextBtn.textContent = "Next";
    }
  }

  function validateStep(index) {
    const requiredEls = Array.from(steps[index].querySelectorAll("[required]"));
    for (const el of requiredEls) {
      if (!el.value.trim()) {
        el.focus();
        alert("Please fill all required fields in this step.");
        return false;
      }
    }
    return true;
  }

  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  showStep(currentStep);
});

const totalSteps = 12;
let currentStep = 1;

function updateProgress() {
  const percent = Math.round((currentStep / totalSteps) * 100);
  const progressFill = document.getElementById("progressFill");
  progressFill.style.width = percent + "%";
  progressFill.textContent = percent + "%";
}

// Example: call this whenever next/prev buttons are clicked
document.getElementById("nextStep").addEventListener("click", () => {
  if (currentStep < totalSteps) currentStep++;
  updateProgress();
});

document.getElementById("prevStep").addEventListener("click", () => {
  if (currentStep > 1) currentStep--;
  updateProgress();
});

// Initialize
updateProgress();

// ===== Sidebar Navigation for Wizard =====
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const steps = Array.from(document.querySelectorAll(".wizard-step"));
  const prevBtn = document.getElementById("prevStep");
  const nextBtn = document.getElementById("nextStep");
  const progressFill = document.getElementById("progressFill");
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((s, i) => (s.style.display = i === index ? "block" : "none"));
    prevBtn.style.display = index === 0 ? "none" : "inline-block";

    // 🔑 Hide Next button entirely on last step
    if (index === steps.length - 1) {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "inline-block";
      nextBtn.textContent = "Next";
    }

    // Sidebar highlight
    navItems.forEach((i) => i.classList.remove("active"));
    navItems[index].classList.add("active");

    // Progress update
    const percent = Math.round(((index + 1) / steps.length) * 100);
    progressFill.style.width = percent + "%";
    progressFill.textContent = percent + "%";
  }

  // Sidebar click → go to that step
  navItems.forEach((item, idx) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      currentStep = idx;
      showStep(currentStep);
    });
  });

  // Prev/Next buttons
  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  // Init
  showStep(currentStep);
});

// ====== Select size fix: show limited number of options consistently ======
// Drop-in: put at end of your script.js or in a new file included after script.js

(function () {
  const MAX_VISIBLE = 8; // change to how many items you want visible when opened

  function enhanceSelect(s) {
    if (s.__sizeEnhanced) return;
    s.__sizeEnhanced = true;

    // remember original size
    const originalSize = s.size || 1;
    s.dataset._originalSize = originalSize;

    // when user presses mouse down (before native opens), convert to size=listbox
    s.addEventListener("mousedown", function (ev) {
      // only for single-selects
      if (s.multiple) return;
      // set size to min(MAX_VISIBLE, options length) so it's limited
      const want = Math.min(MAX_VISIBLE, s.options.length || MAX_VISIBLE);
      s.size = want;
      // prevent default focus jump issues in some browsers:
      // allow subsequent click to select
      // (no ev.preventDefault() here, letting native behavior proceed)
    });

    // when it loses focus or user selects, revert back
    s.addEventListener("blur", function () {
      s.size = s.dataset._originalSize || 1;
    });
    s.addEventListener("change", function () {
      // small delay to allow selection to apply then close
      setTimeout(() => {
        s.size = s.dataset._originalSize || 1;
        // keep the value selected (native does)
      }, 0);
    });

    // also close on Escape key
    s.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        s.size = s.dataset._originalSize || 1;
        s.blur();
      }
    });
  }

  // enhance all existing selects (or restrict to a selector if desired)
  function enhanceAll(selectSelector = "select") {
    document.querySelectorAll(selectSelector).forEach(enhanceSelect);
  }

  // run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => enhanceAll("select"));
  } else {
    enhanceAll("select");
  }

  // Watch for dynamically added selects inside languagesList (or whole document)
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;
        if (n.tagName === "SELECT") enhanceSelect(n);
        // also if node contains selects
        const nested = n.querySelectorAll && n.querySelectorAll("select");
        if (nested && nested.length) nested.forEach(enhanceSelect);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// ===== Declaration Toggle Logic (Final Fixed Version) =====
document
  .getElementById("toggleDeclaration")
  .addEventListener("click", function () {
    const btn = this;
    const container = document.getElementById("declarationContainer");
    const declarationField = document.getElementById("declaration");

    const defaultDeclaration =
      "I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.";

    // Load saved data
    const saved = JSON.parse(localStorage.getItem("resumeData") || "{}");
    const isHidden =
      container.style.display === "none" || container.style.display === "";

    if (isHidden) {
      // --- Show and fill declaration ---
      container.style.display = "block";

      // use saved text if available, else default
      declarationField.value =
        saved.declaration && saved.declaration.trim()
          ? saved.declaration
          : defaultDeclaration;

      // update button
      btn.textContent = " Remove";
      btn.classList.add("btn-danger");

      // ✅ Save to localStorage
      saved.declaration = declarationField.value;
      localStorage.setItem("resumeData", JSON.stringify(saved));
    } else {
      // --- Hide and clear declaration ---
      container.style.display = "none";
      declarationField.value = "";

      btn.textContent = "+ Add Declaration";
      btn.classList.remove("btn-danger");

      // ✅ Remove from localStorage
      if (localStorage.getItem("resumeData")) {
        const data = JSON.parse(localStorage.getItem("resumeData"));
        data.declaration = "";
        localStorage.setItem("resumeData", JSON.stringify(data));
      }

      // ✅ Remove from preview immediately if it's open
      const previewDeclaration = document.querySelector("#preview-declaration");
      if (previewDeclaration) {
        previewDeclaration.textContent = "";
        previewDeclaration.style.display = "none";
      }
    }
  });

// ===== Keep declaration in sync with typing =====
document.getElementById("declaration").addEventListener("input", function () {
  const saved = JSON.parse(localStorage.getItem("resumeData") || "{}");
  saved.declaration = this.value;
  localStorage.setItem("resumeData", JSON.stringify(saved));
});
