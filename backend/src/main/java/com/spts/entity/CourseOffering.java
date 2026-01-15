// Trong class CourseOffering.java
@Column(name = "grading_scale", length = 50, nullable = false)
@NotBlank(message = "Grading scale is required")
private String gradingScale = "SCALE_10"; // Giá trị mặc định là thang 10

// Getter & Setter
public String getGradingScale() {
    return gradingScale;
}

public void setGradingScale(String gradingScale) {
    this.gradingScale = gradingScale;
}