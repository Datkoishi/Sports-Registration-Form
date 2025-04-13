document.addEventListener("DOMContentLoaded", () => {
    // API keys và URLs
    const IMGBB_API_KEY = '069cd353e3b761bf7f4930607e1c1674';
    const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
    // Thay thế URL này bằng URL của Google Form của bạn
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
    
    // Tạo các biểu tượng thể thao nổi
    const sportsIcons = document.getElementById("sportsIcons");
    const icons = [
      "fa-futbol", "fa-basketball-ball", "fa-volleyball-ball", 
      "fa-running", "fa-table-tennis", "fa-chess", 
      "fa-trophy", "fa-medal", "fa-stopwatch"
    ];
    
    for (let i = 0; i < 20; i++) {
      const icon = document.createElement("i");
      icon.className = `fas ${icons[Math.floor(Math.random() * icons.length)]} sports-icon`;
      icon.style.left = `${Math.random() * 100}%`;
      icon.style.animationDuration = `${15 + Math.random() * 10}s`;
      icon.style.animationDelay = `${Math.random() * 5}s`;
      sportsIcons.appendChild(icon);
    }
    
    // Đảm bảo thông báo thành công luôn ẩn khi trang tải
    const successMessage = document.getElementById("successMessage");
    successMessage.classList.add("hidden");
    
    // Elements
    const form = document.getElementById("registrationForm");
    const sportCheckboxes = document.querySelectorAll(".sport-checkbox");
    const selectedCountElement = document.getElementById("selectedCount");
    const submitBtn = document.getElementById("submitBtn");
    const resetBtn = document.getElementById("resetBtn");
    const closeSuccessBtn = document.getElementById("closeSuccessBtn");
    const progressBar = document.getElementById("progressBar");
    const progressPercent = document.getElementById("progressPercent");
  
    // Cập nhật progress bar
    function updateProgress() {
      const requiredFields = form.querySelectorAll("[required]");
      let filledCount = 0;
      
      requiredFields.forEach(field => {
        if (field.type === "checkbox" || field.type === "radio") {
          if (field.checked) filledCount++;
        } else if (field.value.trim() !== "") {
          filledCount++;
        }
      });
      
      // Kiểm tra xem đã chọn ít nhất một môn thi đấu chưa
      const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
      if (selectedSports.length > 0) {
        filledCount++;
      }
      
      const percent = Math.min(Math.round((filledCount / (requiredFields.length + 1)) * 100), 100);
      progressBar.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;
    }
  
    // Cập nhật tên file khi chọn file
    window.updateFileName = (input, elementId) => {
      const fileNameElement = document.getElementById(elementId);
      if (input.files && input.files[0]) {
        fileNameElement.textContent = input.files[0].name;
      } else {
        fileNameElement.textContent = "";
      }
      updateProgress();
    }
  
    // Toggle previous experience details
    window.togglePreviousExperience = (show) => {
      const detailsSection = document.getElementById("previousExperienceDetails");
      if (show) {
        detailsSection.classList.remove("hidden");
        detailsSection.style.animation = "fadeIn 0.5s ease";
      } else {
        detailsSection.classList.add("hidden");
      }
      updateProgress();
    }
  
    // Handle sport selection and sub-options
    sportCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        // Update selected count
        const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
        selectedCountElement.textContent = selectedSports.length;
  
        // Limit to 2 selections
        if (selectedSports.length > 2) {
          this.checked = false;
          selectedCountElement.textContent = document.querySelectorAll(".sport-checkbox:checked").length;
          alert("Bạn chỉ được chọn tối đa 2 môn thi đấu!");
          return;
        }
  
        // Toggle sub-options
        const parentId = this.getAttribute("data-parent");
        if (parentId) {
          const subOptions = document.querySelector(`.sub-options[data-for="${parentId}"]`);
          if (subOptions) {
            if (this.checked) {
              subOptions.classList.remove("hidden");
              subOptions.style.animation = "fadeIn 0.5s ease";
            } else {
              subOptions.classList.add("hidden");
            }
          }
        }
        
        updateProgress();
      });
    });
  
    // Theo dõi sự thay đổi của tất cả các trường input để cập nhật progress bar
    const allInputs = form.querySelectorAll("input, select, textarea");
    allInputs.forEach(input => {
      input.addEventListener("change", updateProgress);
      input.addEventListener("input", updateProgress);
    });
  
    // Hàm upload ảnh lên ImgBB
    async function uploadImageToImgBB(file) {
      if (!file) return null;
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', IMGBB_API_KEY);
      
      try {
        const response = await fetch(IMGBB_UPLOAD_URL, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          return data.data.url;
        } else {
          console.error('Lỗi khi tải ảnh lên ImgBB:', data.error);
          return null;
        }
      } catch (error) {
        console.error('Lỗi khi tải ảnh lên ImgBB:', error);
        return null;
      }
    }
  
    // Hàm chuẩn bị dữ liệu form để gửi đến Google Forms
    async function prepareFormData() {
      const formData = new FormData(form);
      const formDataForGoogle = new FormData();
      
      // Thông tin cá nhân
      const personalInfo = {
        fullName: formData.get('fullName'),
        studentId: formData.get('studentId'),
        birthDate: formData.get('birthDate'),
        gender: formData.get('gender'),
        class: formData.get('class'),
        faculty: formData.get('faculty'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address')
      };
      
      // Thêm thông tin cá nhân vào formDataForGoogle
      for (const [key, value] of Object.entries(personalInfo)) {
        if (value) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId(key)}`, value);
        }
      }
      
      // Xử lý ảnh đại diện
      const photoFile = document.getElementById('photo').files[0];
      if (photoFile) {
        const photoUrl = await uploadImageToImgBB(photoFile);
        if (photoUrl) {
          formDataForGoogle.append(`entry.${getGoogleFormFieldId('photoUrl')}`, photoUrl);
        }
      }
      
      // Kinh nghiệm thi đấu trước đây
      const hasPreviousExperience = document.querySelector('input[name="previousExperience"]:checked')?.value;
      formDataForGoogle.append(`entry.${getGoogleFormFieldId('hasPreviousExperience')}`, hasPreviousExperience || 'Không');
      
      if (hasPreviousExperience === 'Có') {
        const experienceInfo = {
          sportType: formData.get('sportType'),
          competition: formData.get('competition'),
          year: formData.get('year'),
          achievement: formData.get('achievement')
        };
        
        for (const [key, value] of Object.entries(experienceInfo)) {
          if (value) {
            formDataForGoogle.append(`entry.${getGoogleFormFieldId(key)}`, value);
          }
        }
        
        // Xử lý ảnh thành tích
        const achievementPhotoFile = document.getElementById('achievementPhoto').files[0];
        if (achievementPhotoFile) {
          const achievementPhotoUrl = await uploadImageToImgBB(achievementPhotoFile);
          if (achievementPhotoUrl) {
            formDataForGoogle.append(`entry.${getGoogleFormFieldId('achievementPhotoUrl')}`, achievementPhotoUrl);
          }
        }
      }
      
      // Thông tin các môn thể thao đã chọn
      const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
      const sportsArray = Array.from(selectedSports).map(checkbox => checkbox.value);
      formDataForGoogle.append(`entry.${getGoogleFormFieldId('selectedSports')}`, sportsArray.join(', '));
      
      // Xử lý thông tin chi tiết cho từng môn thể thao
      selectedSports.forEach(sport => {
        const sportId = sport.id;
        const sportName = sport.value;
        
        // Thêm tên môn thể thao
        formDataForGoogle.append(`entry.${getGoogleFormFieldId('sportDetails')}`, `Môn: ${sportName}`);
        
        // Xử lý thông tin cân nặng cho các môn liên quan
        if (['tugofwar-male', 'tugofwar-female', 'armwrestling-male', 'armwrestling-female'].includes(sportId)) {
          const weight = document.getElementById(`${sportId}-weight`)?.value;
          if (weight) {
            formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-weight`)}`, weight);
          }
        }
        
        // Xử lý thông tin hạng cân cho môn đẩy gậy
        if (sportId === 'armwrestling-male' || sportId === 'armwrestling-female') {
          const weightClass = document.querySelector(`input[name="${sportId}-weight-class"]:checked`)?.value;
          if (weightClass) {
            formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-weight-class`)}`, weightClass);
          }
        }
        
        // Xử lý thông tin vai trò cho các môn đồng đội
        if (['football-male', 'football-female', 'volleyball-male', 'volleyball-female', 'basketball-male', 'basketball-female'].includes(sportId)) {
          const role = document.querySelector(`input[name="${sportId}-role"]:checked`)?.value;
          if (role) {
            formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-role`)}`, role);
          }
        }
        
        // Xử lý thông tin đối tác cho các môn đôi
        if (['tabletennis-double', 'badminton-double'].includes(sportId)) {
          const partnerId = sportId.split('-')[0];
          const partnerName = document.getElementById(`${partnerId}-partner`)?.value;
          const partnerStudentId = document.getElementById(`${partnerId}-partner-id`)?.value;
          
          if (partnerName) {
            formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-partner-name`)}`, partnerName);
          }
          
          if (partnerStudentId) {
            formDataForGoogle.append(`entry.${getGoogleFormFieldId(`${sportId}-partner-id`)}`, partnerStudentId);
          }
        }
      });
      
      // Thông tin cam kết
      const agreement1 = document.getElementById('agreement1').checked ? 'Đồng ý' : 'Không đồng ý';
      const agreement2 = document.getElementById('agreement2').checked ? 'Đồng ý' : 'Không đồng ý';
      
      formDataForGoogle.append(`entry.${getGoogleFormFieldId('agreement1')}`, agreement1);
      formDataForGoogle.append(`entry.${getGoogleFormFieldId('agreement2')}`, agreement2);
      
      // Thông tin chữ ký
      const signature = formData.get('signature');
      if (signature) {
        formDataForGoogle.append(`entry.${getGoogleFormFieldId('signature')}`, signature);
      }
      
      // Thông tin bổ sung
      const additionalInfo = formData.get('additionalInfo');
      if (additionalInfo) {
        formDataForGoogle.append(`entry.${getGoogleFormFieldId('additionalInfo')}`, additionalInfo);
      }
      
      return formDataForGoogle;
    }
    
    // Hàm lấy ID trường trong Google Form (cần cập nhật theo form thực tế)
    function getGoogleFormFieldId(fieldName) {
      // Mapping giữa tên trường trong form HTML và ID trường trong Google Form
      const fieldMapping = {
        // Thông tin cá nhân
        'fullName': '123456789', // Thay thế bằng ID thực tế
        'studentId': '123456790',
        'birthDate': '123456791',
        'gender': '123456792',
        'class': '123456793',
        'faculty': '123456794',
        'phone': '123456795',
        'email': '123456796',
        'address': '123456797',
        'photoUrl': '123456798',
        
        // Kinh nghiệm thi đấu
        'hasPreviousExperience': '123456799',
        'sportType': '123456800',
        'competition': '123456801',
        'year': '123456802',
        'achievement': '123456803',
        'achievementPhotoUrl': '123456804',
        
        // Thông tin môn thể thao
        'selectedSports': '123456805',
        'sportDetails': '123456806',
        
        // Thông tin cân nặng
        'tugofwar-male-weight': '123456807',
        'tugofwar-female-weight': '123456808',
        'armwrestling-male-weight': '123456809',
        'armwrestling-female-weight': '123456810',
        
        // Thông tin hạng cân
        'armwrestling-male-weight-class': '123456811',
        'armwrestling-female-weight-class': '123456812',
        
        // Thông tin vai trò trong đội
        'football-male-role': '123456813',
        'football-female-role': '123456814',
        'volleyball-male-role': '123456815',
        'volleyball-female-role': '123456816',
        'basketball-male-role': '123456817',
        'basketball-female-role': '123456818',
        
        // Thông tin đối tác cho các môn đôi
        'tabletennis-double-partner-name': '123456819',
        'tabletennis-double-partner-id': '123456820',
        'badminton-double-partner-name': '123456821',
        'badminton-double-partner-id': '123456822',
        
        // Thông tin cam kết
        'agreement1': '123456823',
        'agreement2': '123456824',
        'signature': '123456825',
        
        // Thông tin bổ sung
        'additionalInfo': '123456826',
        
        // Các môn thể thao cụ thể
        'football-male': '123456827',
        'football-female': '123456828',
        'volleyball-male': '123456829',
        'volleyball-female': '123456830',
        'basketball-male': '123456831',
        'basketball-female': '123456832',
        'tabletennis-single': '123456833',
        'tabletennis-double': '123456834',
        'badminton-single': '123456835',
        'badminton-double': '123456836',
        'running-100m': '123456837',
        'running-200m': '123456838',
        'running-400m': '123456839',
        'running-800m': '123456840',
        'running-1500m': '123456841',
        'running-relay': '123456842',
        'swimming-freestyle': '123456843',
        'swimming-breaststroke': '123456844',
        'swimming-backstroke': '123456845',
        'swimming-butterfly': '123456846',
        'swimming-medley': '123456847',
        'swimming-relay': '123456848',
        'tugofwar-male': '123456849',
        'tugofwar-female': '123456850',
        'armwrestling-male': '123456851',
        'armwrestling-female': '123456852',
        'chess': '123456853',
        'esports': '123456854'
      };
      
      return fieldMapping[fieldName] || '0'; // Trả về '0' nếu không tìm thấy mapping
    }
  
    // Hàm gửi dữ liệu đến Google Forms
    async function submitToGoogleForm(formData) {
      try {
        const response = await fetch(GOOGLE_FORM_URL, {
          method: 'POST',
          body: formData,
          mode: 'no-cors' // Google Form yêu cầu mode no-cors
        });
        
        // Do mode là no-cors, chúng ta không thể đọc response
        // Giả định rằng form đã được gửi thành công
        return true;
      } catch (error) {
        console.error('Lỗi khi gửi form đến Google Forms:', error);
        return false;
      }
    }
  
    // Form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      // Basic validation
      if (!validateForm()) {
        return;
      }
  
      // Kiểm tra xem tất cả các trường bắt buộc đã được điền chưa
      if (!form.checkValidity()) {
        // Kích hoạt kiểm tra tính hợp lệ của trình duyệt
        form.reportValidity();
        return;
      }
  
      // Kiểm tra xem đã chọn ít nhất một môn thi đấu chưa
      const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
      if (selectedSports.length === 0) {
        alert("Vui lòng chọn ít nhất một môn thi đấu!");
        return;
      }
  
      // Hiển thị trạng thái đang gửi
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
  
      try {
        // Chuẩn bị dữ liệu form
        const formData = await prepareFormData();
        
        // Gửi dữ liệu đến Google Forms
        const success = await submitToGoogleForm(formData);
        
        if (success) {
          // Hiển thị thông báo thành công
          successMessage.classList.remove("hidden");
        } else {
          alert("Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau!");
        }
      } catch (error) {
        console.error('Lỗi trong quá trình gửi form:', error);
        alert("Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau!");
      } finally {
        // Khôi phục trạng thái nút gửi
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đăng ký';
      }
    });
  
    // Close success message
    closeSuccessBtn.addEventListener("click", () => {
      successMessage.classList.add("hidden");
      form.reset();
      // Reset all sub-options
      document.querySelectorAll(".sub-options").forEach((el) => {
        el.classList.add("hidden");
      });
      // Reset selected count
      selectedCountElement.textContent = "0";
      // Reset previous experience details
      document.getElementById("previousExperienceDetails").classList.add("hidden");
      // Reset file names
      document.querySelectorAll(".file-name").forEach(el => {
        el.textContent = "";
      });
      // Reset progress bar
      progressBar.style.width = "0%";
      progressPercent.textContent = "0%";
    });
  
    // Reset button
    resetBtn.addEventListener("click", () => {
      // Reset all sub-options
      document.querySelectorAll(".sub-options").forEach((el) => {
        el.classList.add("hidden");
      });
      // Reset selected count
      selectedCountElement.textContent = "0";
      // Reset previous experience details
      document.getElementById("previousExperienceDetails").classList.add("hidden");
      // Reset file names
      document.querySelectorAll(".file-name").forEach(el => {
        el.textContent = "";
      });
      // Reset progress bar
      progressBar.style.width = "0%";
      progressPercent.textContent = "0%";
    });
  
    // Form validation
    function validateForm() {
      // Kiểm tra các trường bắt buộc
      const requiredFields = form.querySelectorAll("[required]");
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.focus();
          isValid = false;
          return false;
        }
      });
      
      if (!isValid) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return false;
      }
  
      // Check if at least one sport is selected
      const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
      if (selectedSports.length === 0) {
        alert("Vui lòng chọn ít nhất một môn thi đấu!");
        return false;
      }
  
      // Check agreements
      if (!document.getElementById("agreement1").checked || !document.getElementById("agreement2").checked) {
        alert("Vui lòng đồng ý với các điều khoản cam kết!");
        return false;
      }
  
      // Check if weight is provided for weight-based sports
      const weightBasedSports = ["tugofwar-male", "tugofwar-female", "armwrestling-male", "armwrestling-female"];
  
      for (const sportId of weightBasedSports) {
        const sportCheckbox = document.getElementById(sportId);
        if (sportCheckbox && sportCheckbox.checked) {
          const weightInput = document.getElementById(`${sportId}-weight`);
          if (weightInput && (!weightInput.value || isNaN(weightInput.value))) {
            alert("Vui lòng nhập cân nặng cho các môn yêu cầu thông tin này!");
            weightInput.focus();
            return false;
          }
        }
      }
  
      // Check if weight class is selected for arm wrestling
      if (document.getElementById("armwrestling-male") && document.getElementById("armwrestling-male").checked) {
        const weightClass = document.querySelector('input[name="armwrestling-male-weight-class"]:checked');
        if (!weightClass) {
          alert("Vui lòng chọn hạng cân cho môn Đẩy gậy nam!");
          return false;
        }
      }
  
      if (document.getElementById("armwrestling-female") && document.getElementById("armwrestling-female").checked) {
        const weightClass = document.querySelector('input[name="armwrestling-female-weight-class"]:checked');
        if (!weightClass) {
          alert("Vui lòng chọn hạng cân cho môn Đẩy gậy nữ!");
          return false;
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
      ];
  
      for (const sportId of teamSports) {
        const sportCheckbox = document.getElementById(sportId);
        if (sportCheckbox && sportCheckbox.checked) {
          const roleSelected = document.querySelector(`input[name="${sportId}-role"]:checked`);
          if (!roleSelected) {
            alert(`Vui lòng chọn vai trò cho môn ${sportCheckbox.value}!`);
            return false;
          }
        }
      }
  
      // Check partner information for doubles sports
      const doublesSports = [
        "tabletennis-double",
        "badminton-double"
      ];
  
      for (const sportId of doublesSports) {
        const sportCheckbox = document.getElementById(sportId);
        if (sportCheckbox && sportCheckbox.checked) {
          const partnerId = sportId.split('-')[0];
          const partnerName = document.getElementById(`${partnerId}-partner`);
          const partnerStudentId = document.getElementById(`${partnerId}-partner-id`);
          
          if (!partnerName || !partnerName.value.trim()) {
            alert(`Vui lòng nhập tên đối tác cho môn ${sportCheckbox.value}!`);
            if (partnerName) partnerName.focus();
            return false;
          }
          
          if (!partnerStudentId || !partnerStudentId.value.trim()) {
            alert(`Vui lòng nhập MSSV đối tác cho môn ${sportCheckbox.value}!`);
            if (partnerStudentId) partnerStudentId.focus();
            return false;
          }
        }
      }
  
      return true;
    }
  
    // Khởi tạo progress bar
    updateProgress();
    
    // Thêm hiệu ứng scroll mượt khi click vào các section
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
    
    // Thêm hiệu ứng hover 3D cho các phần tử
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach(section => {
      section.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = x / rect.width - 0.5;
        const yPercent = y / rect.height - 0.5;
        
        const rotateX = yPercent * -3;
        const rotateY = xPercent * 3;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
      
      section.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  });