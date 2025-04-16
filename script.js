document.addEventListener("DOMContentLoaded", () => {
  // API keys và URLs
  const IMGBB_API_KEY = "069cd353e3b761bf7f4930607e1c1674"
  const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload"
  // Thay thế URL này bằng URL của Google Form của bạn
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse"

  // Tạo các biểu tượng thể thao nổi
  const sportsIcons = document.getElementById("sportsIcons")
  const icons = [
    "fa-futbol",
    "fa-basketball-ball",
    "fa-volleyball-ball",
    "fa-running",
    "fa-table-tennis",
    "fa-chess",
    "fa-trophy",
    "fa-medal",
    "fa-stopwatch",
  ]

  for (let i = 0; i < 20; i++) {
    const icon = document.createElement("i")
    icon.className = `fas ${icons[Math.floor(Math.random() * icons.length)]} sports-icon`
    icon.style.left = `${Math.random() * 100}%`
    icon.style.animationDuration = `${15 + Math.random() * 10}s`
    icon.style.animationDelay = `${Math.random() * 5}s`
    sportsIcons.appendChild(icon)
  }

  // Đảm bảo thông báo thành công luôn ẩn khi trang tải
  const successMessage = document.getElementById("successMessage")
  successMessage.classList.add("hidden")

  // Elements
  const form = document.getElementById("registrationForm")
  const sportCheckboxes = document.querySelectorAll(".sport-checkbox")
  const selectedCountElement = document.getElementById("selectedCount")
  const submitBtn = document.getElementById("submitBtn")
  const resetBtn = document.getElementById("resetBtn")
  const closeSuccessBtn = document.getElementById("closeSuccessBtn")
  const progressBar = document.getElementById("progressBar")
  const progressPercent = document.getElementById("progressPercent")

  // Cập nhật progress bar
  function updateProgress() {
    const requiredFields = form.querySelectorAll("[required]")
    let filledCount = 0

    requiredFields.forEach((field) => {
      if (field.type === "checkbox" || field.type === "radio") {
        if (field.checked) filledCount++
      } else if (field.value.trim() !== "") {
        filledCount++
      }
    })

    // Kiểm tra xem đã chọn ít nhất một môn thi đấu chưa
    const selectedSports = document.querySelectorAll(".sport-checkbox:checked")
    if (selectedSports.length > 0) {
      filledCount++
    }

    const percent = Math.min(Math.round((filledCount / (requiredFields.length + 1)) * 100), 100)
    progressBar.style.width = `${percent}%`
    progressPercent.textContent = `${percent}%`
  }

  // Cập nhật tên file khi chọn file
  window.updateFileName = (input, elementId) => {
    const fileNameElement = document.getElementById(elementId)
    if (input.files && input.files[0]) {
      fileNameElement.textContent = input.files[0].name
    } else {
      fileNameElement.textContent = ""
    }
    updateProgress()
  }

  // Toggle previous experience details
  window.togglePreviousExperience = (show) => {
    const detailsSection = document.getElementById("previousExperienceDetails")
    if (show) {
      detailsSection.classList.remove("hidden")
      detailsSection.style.animation = "fadeIn 0.5s ease"
    } else {
      detailsSection.classList.add("hidden")
    }
    updateProgress()
  }

  // Handle sport selection and sub-options
  sportCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      // Update selected count
      const selectedSports = document.querySelectorAll(".sport-checkbox:checked")
      selectedCountElement.textContent = selectedSports.length

      // Limit to 2 selections
      if (selectedSports.length > 2) {
        this.checked = false
        selectedCountElement.textContent = document.querySelectorAll(".sport-checkbox:checked").length
        alert("Bạn chỉ được chọn tối đa 2 môn thi đấu!")
        return
      }

      // Toggle sub-options
      const parentId = this.getAttribute("data-parent")
      if (parentId) {
        const subOptions = document.querySelector(`.sub-options[data-for="${parentId}"]`)
        if (subOptions) {
          if (this.checked) {
            subOptions.classList.remove("hidden")
            subOptions.style.animation = "fadeIn 0.5s ease"
          } else {
            subOptions.classList.add("hidden")
          }
        }
      }

      // Cập nhật giá trị "Có" hoặc "Không" cho trường ẩn tương ứng
      const hiddenValueField = document.getElementById(`${this.id}-value`)
      if (hiddenValueField) {
        hiddenValueField.value = this.checked ? "Có" : "Không"
      }

      updateProgress()
    })
  })

  // Theo dõi sự thay đổi của tất cả các trường input để cập nhật progress bar
  const allInputs = form.querySelectorAll("input, select, textarea")
  allInputs.forEach((input) => {
    input.addEventListener("change", updateProgress)
    input.addEventListener("input", updateProgress)
  })

  // Hàm upload ảnh lên ImgBB
  async function uploadImageToImgBB(file) {
    if (!file) return null

    const formData = new FormData()
    formData.append("image", file)
    formData.append("key", IMGBB_API_KEY)

    try {
      const response = await fetch(IMGBB_UPLOAD_URL, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        return data.data.url
      } else {
        console.error("Lỗi khi tải ảnh lên ImgBB:", data.error)
        return null
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên ImgBB:", error)
      return null
    }
  }

  // Hàm chuẩn bị dữ liệu form để gửi đến Google Forms
  async function prepareFormData() {
    const formData = new FormData(form)
    const formDataForGoogle = new FormData()

    // Thông tin cá nhân
    const personalInfo = {
      fullName: formData.get("fullName"),
      studentId: formData.get("studentId"),
      birthDate: formData.get("birthDate"),
      gender: formData.get("gender"),
      class: formData.get("class"),
      faculty: formData.get("faculty"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
    }

    // Thêm thông tin cá nhân vào formDataForGoogle
    for (const [key, value] of Object.entries(personalInfo)) {
      if (value) {
        formDataForGoogle.append(`entry.${getGoogleFormFieldId(key)}`, value)
      }
    }

    // Xử lý ảnh đại diện
    const photoFile = document.getElementById("photo").files[0]
    if (photoFile) {
      const photoUrl = await uploadImageToImgBB(photoFile)
      if (photoUrl) {
        formDataForGoogle.append(`entry.${getGoogleFormFieldId("photoUrl")}`, photoUrl)
      }
    }

    // Kinh nghiệm thi đấu trước đây
    const hasPreviousExperience = document.querySelector('input[name="previousExperience"]:checked')?.value
    formDataForGoogle.append(`entry.${getGoogleFormFieldId("hasPreviousExperience")}`, hasPreviousExperience || "Không")

    if (hasPreviousExperience === "Có") {
      const experienceInfo = {
        sportType: formData.get("sportType"),
        competition: formData.get("competition"),
        year: formData.get("year"),
        achievement: formData.get("achievement"),
      }

      for (const [key, value] of Object.entries(experienceInfo)) {
        if (value) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId(key)}`, value)
        }
      }

      // Xử lý ảnh thành tích
      const achievementPhotoFile = document.getElementById("achievementPhoto").files[0]
      if (achievementPhotoFile) {
        const achievementPhotoUrl = await uploadImageToImgBB(achievementPhotoFile)
        if (achievementPhotoUrl) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId("achievementPhotoUrl")}`, achievementPhotoUrl)
        }
      }
    }

    // Thông tin các môn thể thao đã chọn
    const selectedSports = document.querySelectorAll(".sport-checkbox:checked")
    const sportsArray = Array.from(selectedSports).map((checkbox) => checkbox.value)
    formDataForGoogle.append(`entry.${getGoogleFormFieldId("selectedSports")}`, sportsArray.join(", "))

    // Xử lý thông tin chi tiết cho từng môn thể thao
    // Thêm tất cả các giá trị "Có" hoặc "Không" cho mỗi môn thể thao
    const sportValueFields = document.querySelectorAll('input[id$="-value"]')
    sportValueFields.forEach((field) => {
      const sportId = field.id.replace("-value", "")
      formDataForGoogle.append(`entry.${getGoogleFormFieldId(sportId)}`, field.value)
    })

    // Xử lý thông tin chi tiết cho từng môn thể thao
    selectedSports.forEach((sport) => {
      const sportId = sport.id
      const sportName = sport.value

      // Thêm tên môn thể thao
      formDataForGoogle.append(`entry.${getGoogleFormFieldId("sportDetails")}`, `Môn: ${sportName}`)

      // Xử lý thông tin cân nặng cho các môn liên quan
      if (["tugofwar-male", "tugofwar-female", "armwrestling-male", "armwrestling-female"].includes(sportId)) {
        const weight = document.getElementById(`${sportId}-weight`)?.value
        if (weight) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-weight`)}`, weight)
        }
      }

      // Xử lý thông tin hạng cân cho môn đẩy gậy
      if (sportId === "armwrestling-male" || sportId === "armwrestling-female") {
        const weightClass = document.querySelector(`input[name="${sportId}-weight-class"]:checked`)?.value
        if (weightClass) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-weight-class`)}`, weightClass)
        }
      }

      // Xử lý thông tin vai trò cho các môn đồng đội
      if (
        [
          "football-male",
          "football-female",
          "volleyball-male",
          "volleyball-female",
          "basketball-male",
          "basketball-female",
        ].includes(sportId)
      ) {
        const role = document.querySelector(`input[name="${sportId}-role"]:checked`)?.value
        if (role) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-role`)}`, role)
        }
      }

      // Xử lý thông tin đối tác cho các môn đôi
      const doublesSports = [
        "tabletennis-mixed",
        "badminton-female-double",
        "badminton-mixed",
        "pickleball-male",
        "pickleball-female",
        "pickleball-mixed",
      ]

      if (doublesSports.includes(sportId)) {
        // Xác định tiền tố cho ID của trường đối tác
        let partnerId
        if (sportId.includes("tabletennis")) {
          partnerId = "tabletennis"
        } else if (sportId.includes("badminton")) {
          partnerId = sportId
        } else if (sportId.includes("pickleball")) {
          partnerId = sportId
        }

        // Lấy tên đối tác
        const partnerName = document.getElementById(`${partnerId}-partner`)?.value
        if (partnerName) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-partner-name`)}`, partnerName)
        }

        // Lấy MSSV đối tác
        const partnerStudentId = document.getElementById(`${partnerId}-partner-id`)?.value
        if (partnerStudentId) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-partner-id`)}`, partnerStudentId)
        }
      }
    })

    // Xử lý thông tin Liên Quân Mobile
    if (document.getElementById("aov").checked) {
      const aovInfo = {
        "aov-team-name": formData.get("aov-team-name"),
        "aov-rank": formData.get("aov-rank"),
      }

      for (const [key, value] of Object.entries(aovInfo)) {
        if (value) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId(key)}`, value)
        }
      }

      // Xử lý ảnh minh chứng rank
      const rankProofFile = document.getElementById("aov-rank-proof").files[0]
      if (rankProofFile) {
        const rankProofUrl = await uploadImageToImgBB(rankProofFile)
        if (rankProofUrl) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId("aov-rank-proof-url")}`, rankProofUrl)
        }
      }

      // Xử lý thông tin thành viên team
      let teamMembersInfo = ""
      for (let i = 1; i <= 6; i++) {
        const memberName = formData.get(`aov-member-${i}-name`)
        const memberId = formData.get(`aov-member-${i}-id`)
        const memberRole = formData.get(`aov-member-${i}-role`)

        if (memberName || memberId || memberRole) {
          teamMembersInfo += `Thành viên ${i}: ${memberName || ""} - ${memberId || ""} - ${memberRole || ""}\n`
        }
      }

      if (teamMembersInfo) {
        formDataForGoogle.append(`entry.${getGoogleFormFieldId("aov-team-members")}`, teamMembersInfo)
      }
    }

    // Thông tin cam kết
    const agreement1 = document.getElementById("agreement1").checked ? "Đồng ý" : "Không đồng ý"
    const agreement2 = document.getElementById("agreement2").checked ? "Đồng ý" : "Không đồng ý"

    formDataForGoogle.append(`entry.${getGoogleFormFieldId("agreement1")}`, agreement1)
    formDataForGoogle.append(`entry.${getGoogleFormFieldId("agreement2")}`, agreement2)

    // Thông tin chữ ký
    const signature = formData.get("signature")
    if (signature) {
      formDataForGoogle.append(`entry.${getGoogleFormFieldId("signature")}`, signature)
    }

    // Thông tin bổ sung
    const additionalInfo = formData.get("additionalInfo")
    if (additionalInfo) {
      formDataForGoogle.append(`entry.${getGoogleFormFieldId("additionalInfo")}`, additionalInfo)
    }

    return formDataForGoogle
  }

  // Hàm lấy ID trường trong Google Form (đã cập nhật với ID thực tế)
  function getGoogleFormFieldId(fieldName) {
    // Mapping giữa tên trường trong form HTML và ID trường trong Google Form
    const fieldMapping = {
      // Thông tin cá nhân
      fullName: "1113460450",
      studentId: "642367417",
      birthDate: "380028155",
      gender: "1113875280",
      class: "1684006193",
      faculty: "1309840940",
      phone: "334062443",
      email: "1510098840",
      address: "84585725",
      photoUrl: "371512557",

      // Kinh nghiệm thi đấu
      hasPreviousExperience: "1229418688",
      sportType: "1871591692",
      competition: "1668813952",
      year: "1698088874",
      achievement: "598479751",
      achievementPhotoUrl: "1569988044",

      // Thông tin môn thể thao
      selectedSports: "994028588",
      sportDetails: "353762916",

      // Thông tin cân nặng
      "tugofwar-male-weight": "228046917",
      "tugofwar-female-weight": "1983595057",
      "armwrestling-male-weight": "2084912941",
      "armwrestling-female-weight": "1640252800",

      // Thông tin hạng cân
      "armwrestling-male-weight-class": "66341367",
      "armwrestling-female-weight-class": "1539555870",

      // Thông tin vai trò trong đội
      "football-male-role": "1917865115",
      "football-female-role": "275835132",
      "volleyball-male-role": "969408623",
      "volleyball-female-role": "2093317844",
      "basketball-male-role": "1985385491",
      "basketball-female-role": "298934308",

      // Thông tin đối tác cho các môn đôi
      "tabletennis-mixed-partner-name": "1566216721",
      "tabletennis-mixed-partner-id": "1284979063",
      "badminton-female-double-partner-name": "2075279299",
      "badminton-female-double-partner-id": "462594385",
      "badminton-mixed-partner-name": "1566216722",
      "badminton-mixed-partner-id": "1284979064",
      "pickleball-male-partner-name": "2075279300",
      "pickleball-male-partner-id": "462594386",
      "pickleball-female-partner-name": "1566216723",
      "pickleball-female-partner-id": "1284979065",
      "pickleball-mixed-partner-name": "2075279301",
      "pickleball-mixed-partner-id": "462594387",

      // Thông tin cam kết
      agreement1: "377786695",
      agreement2: "806678147",
      signature: "1956319859",

      // Thông tin bổ sung
      additionalInfo: "1693050404",

      // Các môn thể thao cụ thể (Có/Không)
      "football-male": "680313214",
      "football-female": "1970594183",
      "volleyball-male": "916784086",
      "volleyball-female": "837954294",
      "basketball-male": "1922601745",
      "basketball-female": "1353616254",
      "tugofwar-male": "479448296",
      "tugofwar-female": "755046850",
      "sprint-male": "1635967876", // Chạy ngắn 100m nam
      "sprint-female": "2104612627", // Chạy ngắn 100m nữ
      "endurance-male": "1854128484", // Chạy bền 1500m nam
      "endurance-female": "594067191", // Chạy bền 800m nữ
      "longjump-male": "1341604609", // Nhảy xa nam
      "longjump-female": "499085329", // Nhảy xa nữ
      "armwrestling-male": "2013345739",
      "armwrestling-female": "644917825",
      "badminton-female-single": "1389512352",
      "badminton-female-double": "81178371",
      "badminton-mixed": "660488411",
      "chess-male": "1333431401", // Cờ vua nam
      "chess-female": "1091290327", // Cờ vua nữ
      "xiangqi-male": "588971903", // Cờ tướng nam
      "xiangqi-female": "2009299746", // Cờ tướng nữ
      "tabletennis-male": "1760153496", // Bóng bàn đơn nam
      "tabletennis-female": "539259020", // Bóng bàn đơn nữ
      "tabletennis-mixed": "1416500277", // Bóng bàn đôi nam-nữ
      "pickleball-male": "37001335", // Pickleball đôi nam
      "pickleball-female": "1395738826", // Pickleball đôi nữ
      "pickleball-mixed": "1245264040", // Pickleball đôi nam-nữ
      aov: "201643674", // Liên Quân Mobile

      // Thông tin Liên Quân Mobile
      "aov-team-name": "212317365",
      "aov-rank": "1639114313",
      "aov-rank-proof-url": "1853155342",
      "aov-team-members": "1364686283",

      // Các trường bổ sung (nếu cần)
      "additional-field-1": "302201637",
      "additional-field-2": "1686966385",
      "additional-field-3": "1566011232",
      "additional-field-4": "1236929183",
      "additional-field-5": "1664691521",
      "additional-field-6": "655067707",
      "additional-field-7": "1999119079",
    }

    return fieldMapping[fieldName] || "0" // Trả về '0' nếu không tìm thấy mapping
  }

  // Hàm gửi dữ liệu đến Google Forms
  async function submitToGoogleForm(formData) {
    try {
      const response = await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        body: formData,
        mode: "no-cors", // Google Form yêu cầu mode no-cors
      })

      // Do mode là no-cors, chúng ta không thể đọc response
      // Giả định rằng form đã được gửi thành công
      return true
    } catch (error) {
      console.error("Lỗi khi gửi form đến Google Forms:", error)
      return false
    }
  }

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Basic validation
    if (!validateForm()) {
      return
    }

    // Kiểm tra xem tất cả các trường bắt buộc đã được điền chưa
    if (!form.checkValidity()) {
      // Kích hoạt kiểm tra tính hợp lệ của trình duyệt
      form.reportValidity()
      return
    }

    // Kiểm tra xem đã chọn ít nhất một môn thi đấu chưa
    const selectedSports = document.querySelectorAll(".sport-checkbox:checked")
    if (selectedSports.length === 0) {
      alert("Vui lòng chọn ít nhất một môn thi đấu!")
      return
    }

    // Hiển thị trạng thái đang gửi
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...'

    try {
      // Chuẩn bị dữ liệu form
      const formData = await prepareFormData()

      // Gửi dữ liệu đến Google Forms
      const success = await submitToGoogleForm(formData)

      if (success) {
        // Hiển thị thông báo thành công
        successMessage.classList.remove("hidden")
      } else {
        alert("Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau!")
      }
    } catch (error) {
      console.error("Lỗi trong quá trình gửi form:", error)
      alert("Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau!")
    } finally {
      // Khôi phục trạng thái nút gửi
      submitBtn.disabled = false
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đăng ký'
    }
  })

  // Close success message
  closeSuccessBtn.addEventListener("click", () => {
    successMessage.classList.add("hidden")
    form.reset()
    // Reset all sub-options
    document.querySelectorAll(".sub-options").forEach((el) => {
      el.classList.add("hidden")
    })
    // Reset selected count
    selectedCountElement.textContent = "0"
    // Reset previous experience details
    document.getElementById("previousExperienceDetails").classList.add("hidden")
    // Reset file names
    document.querySelectorAll(".file-name").forEach((el) => {
      el.textContent = ""
    })
    // Reset progress bar
    progressBar.style.width = "0%"
    progressPercent.textContent = "0%"

    // Reset hidden value fields
    const hiddenValueFields = document.querySelectorAll('input[id$="-value"]')
    hiddenValueFields.forEach((field) => {
      field.value = "Không"
    })
  })

  // Reset button
  resetBtn.addEventListener("click", () => {
    // Reset all sub-options
    document.querySelectorAll(".sub-options").forEach((el) => {
      el.classList.add("hidden")
    })
    // Reset selected count
    selectedCountElement.textContent = "0"
    // Reset previous experience details
    document.getElementById("previousExperienceDetails").classList.add("hidden")
    // Reset file names
    document.querySelectorAll(".file-name").forEach((el) => {
      el.textContent = ""
    })
    // Reset progress bar
    progressBar.style.width = "0%"
    progressPercent.textContent = "0%"

    // Reset hidden value fields
    const hiddenValueFields = document.querySelectorAll('input[id$="-value"]')
    hiddenValueFields.forEach((field) => {
      field.value = "Không"
    })
  })

  // Form validation
  function validateForm() {
    // Kiểm tra các trường bắt buộc
    const requiredFields = form.querySelectorAll("[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.focus()
        isValid = false
        return false
      }
    })

    if (!isValid) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!")
      return false
    }

    // Check if at least one sport is selected
    const selectedSports = document.querySelectorAll(".sport-checkbox:checked")
    if (selectedSports.length === 0) {
      alert("Vui lòng chọn ít nhất một môn thi đấu!")
      return false
    }

    // Check agreements
    if (!document.getElementById("agreement1").checked || !document.getElementById("agreement2").checked) {
      alert("Vui lòng đồng ý với các điều khoản cam kết!")
      return false
    }

    // Check if weight is provided for weight-based sports
    const weightBasedSports = ["tugofwar-male", "tugofwar-female", "armwrestling-male", "armwrestling-female"]

    for (const sportId of weightBasedSports) {
      const sportCheckbox = document.getElementById(sportId)
      if (sportCheckbox && sportCheckbox.checked) {
        const weightInput = document.getElementById(`${sportId}-weight`)
        if (weightInput && (!weightInput.value || isNaN(weightInput.value))) {
          alert("Vui lòng nhập cân nặng cho các môn yêu cầu thông tin này!")
          weightInput.focus()
          return false
        }
      }
    }

    // Check if weight class is selected for arm wrestling
    if (document.getElementById("armwrestling-male") && document.getElementById("armwrestling-male").checked) {
      const weightClass = document.querySelector('input[name="armwrestling-male-weight-class"]:checked')
      if (!weightClass) {
        alert("Vui lòng chọn hạng cân cho môn Đẩy gậy nam!")
        return false
      }
    }

    if (document.getElementById("armwrestling-female") && document.getElementById("armwrestling-female").checked) {
      const weightClass = document.querySelector('input[name="armwrestling-female-weight-class"]:checked')
      if (!weightClass) {
        alert("Vui lòng chọn hạng cân cho môn Đẩy gậy nữ!")
        return false
      }
    }

    // Check if role is selected for team sports
    const teamSports = [
      "football-male",
      "football-female",
      "volleyball-male",
      "volleyball-female",
      "basketball-male",
      "basketball-female",
    ]

    for (const sportId of teamSports) {
      const sportCheckbox = document.getElementById(sportId)
      if (sportCheckbox && sportCheckbox.checked) {
        const roleSelected = document.querySelector(`input[name="${sportId}-role"]:checked`)
        if (!roleSelected) {
          alert(`Vui lòng chọn vai trò cho môn ${sportCheckbox.value}!`)
          return false
        }
      }
    }

    // Check partner information for doubles sports
    const doublesSports = [
      "tabletennis-mixed",
      "badminton-female-double",
      "badminton-mixed",
      "pickleball-male",
      "pickleball-female",
      "pickleball-mixed",
    ]

    for (const sportId of doublesSports) {
      const sportCheckbox = document.getElementById(sportId)
      if (sportCheckbox && sportCheckbox.checked) {
        let partnerId
        if (sportId.includes("tabletennis")) {
          partnerId = "tabletennis"
        } else if (sportId.includes("badminton")) {
          partnerId = sportId
        } else if (sportId.includes("pickleball")) {
          partnerId = sportId
        }

        const partnerName = document.getElementById(`${partnerId}-partner`)
        const partnerStudentId = document.getElementById(`${partnerId}-partner-id`)

        if (!partnerName || !partnerName.value.trim()) {
          alert(`Vui lòng nhập tên đối tác cho môn ${sportCheckbox.value}!`)
          if (partnerName) partnerName.focus()
          return false
        }

        if (!partnerStudentId || !partnerStudentId.value.trim()) {
          alert(`Vui lòng nhập MSSV đối tác cho môn ${sportCheckbox.value}!`)
          if (partnerStudentId) partnerStudentId.focus()
          return false
        }
      }
    }

    return true
  }

  // Khởi tạo progress bar
  updateProgress()

  // Thêm hiệu ứng scroll mượt khi click vào các section
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      })
    })
  })

  // Thêm hiệu ứng hover 3D cho các phần tử
  const formSections = document.querySelectorAll(".form-section")
  formSections.forEach((section) => {
    section.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const xPercent = x / rect.width - 0.5
      const yPercent = y / rect.height - 0.5

      const rotateX = yPercent * -3
      const rotateY = xPercent * 3

      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
    })

    section.addEventListener("mouseleave", function () {
      this.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)"
    })
  })
})
