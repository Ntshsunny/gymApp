package com.gymtracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "EXERCISE")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "MUSCLE_GROUP", nullable = false, length = 50)
    private String muscleGroup;

    /** Link to a sample/tutorial video (e.g. YouTube). */
    @Column(name = "VIDEO_URL", length = 500)
    private String videoUrl;

    @Column(length = 500)
    private String description;

    /** null = built-in exercise shared by everyone; otherwise the user who created it. */
    @Column(name = "OWNER_ID")
    private Long ownerId;

    public Exercise() {}

    public Exercise(String name, String muscleGroup, String videoUrl, String description) {
        this.name = name;
        this.muscleGroup = muscleGroup;
        this.videoUrl = videoUrl;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMuscleGroup() { return muscleGroup; }
    public void setMuscleGroup(String muscleGroup) { this.muscleGroup = muscleGroup; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}
